# PLAN: Fix silent data loss of per-variant spec values in the admin product editor

**Rank: 3 of 5.**

## Goal

Products can have model variants (e.g. the tapping machine's `RTM-U-324-1500 RPM` /
`1900 RPM`), and spec rows can carry a per-variant `values` JSONB map
(`{"RTM-U-324-1500 RPM": "1500 rpm", ...}`) instead of a single `value`. The public
[components/SpecReadout.tsx](components/SpecReadout.tsx) renders these (lines 19–32), and
`supabase/seed.sql` (line 367) seeds them. **But the admin editor cannot see or save them:**
`SpecBuilder` only models `{label, value}`, and `ProductForm.saveSpecGroups` deletes ALL
spec groups/rows and re-inserts only `label`/`value`. Result: opening any variant product
in `/admin/products/[id]` and clicking Save silently destroys every per-variant spec value
with no error. Fix the round-trip so `values` survives editing, and make the save
non-destructive on failure.

## Files to touch

1. `components/admin/SpecBuilder.tsx` — model + edit per-variant values
2. `components/admin/ProductForm.tsx` — load and save `values`; harden the save sequence

## Implementation order

### Step 1 — Extend the draft model in `SpecBuilder.tsx`

Change (line 5):

```ts
export interface SpecRowDraft {
  id: string;
  label: string;
  value: string;
  values?: Record<string, string>;  // per-variant values, keyed by variant name
}
```

### Step 2 — Render per-variant inputs in `SpecBuilder`

In the row renderer (lines 72–83): when `variants` is non-empty, render — in addition to
the existing shared-value input — one small input per variant for `row.values?.[variant]`,
labeled with the variant name. Add an update helper:

```ts
function updateRowVariantValue(gid: string, rid: string, variant: string, val: string) {
  onChange(groups.map(g => g.id === gid
    ? { ...g, rows: g.rows.map(r => r.id === rid
        ? { ...r, values: { ...(r.values ?? {}), [variant]: val } }
        : r) }
    : g));
}
```

Layout suggestion: keep the label + shared-value inputs on the first line; when variants
exist, render the per-variant inputs in a second indented row beneath, each prefixed with
the variant string in `text-[10px] text-graphite/40`. Follow the existing Tailwind classes
on sibling inputs. Keep the existing placeholder text on the shared input
("Shared value (leave blank if per-variant)").

### Step 3 — Load `values` into the draft in `ProductForm.tsx`

In the `specGroups` initial state (lines 40–49), the row mapping currently drops `values`.
Change the map to:

```ts
.map(r => ({
  id: r.id,
  label: r.label,
  value: r.value ?? "",
  values: (r.values as Record<string, string> | null) ?? undefined,
}))
```

(`DbSpecRow.values` is already typed in `lib/supabase/db-types.ts` — check its exact type
there and cast accordingly.)

### Step 4 — Save `values` in `saveSpecGroups` (ProductForm.tsx lines 106–127)

In the row insert, include values, and prune empty strings:

```ts
const cleanedValues = r.values
  ? Object.fromEntries(Object.entries(r.values).filter(([, v]) => v && v.trim()))
  : null;
await supabase.from("spec_rows").insert({
  spec_group_id: gd.id,
  label: r.label,
  value: r.value || null,
  values: cleanedValues && Object.keys(cleanedValues).length > 0 ? cleanedValues : null,
  sort_order: ri + 1,
});
```

### Step 5 — Make the save order non-destructive

Current sequence: `delete all spec_groups` (cascades to spec_rows) → loop of individual
inserts. If the browser tab closes or any insert fails mid-loop, the product's specs are
permanently gone. Restructure `saveSpecGroups`:

1. Build the full payload first (all groups, all rows) in memory.
2. Insert all NEW groups in one batched `insert([...]).select()` call.
3. Insert all rows in one batched `insert([...])` call (map group drafts to returned ids
   by array index — Supabase returns inserted rows in insert order).
4. Only after both inserts succeed, delete the OLD groups:
   `delete().eq("product_id", productId).not("id", "in", `(${newGroupIds.join(",")})`)` —
   or simpler and equally safe: delete old groups by their known previous ids (collect
   `existingGroups.map(g => g.id)` passed into the form as props).
5. If any insert errors, surface it via `setError(...)` and DO NOT delete anything.

Apply the same insert-then-delete-old ordering to `saveImages` (lines 129–143).

Also: `handleSubmit` (line 175) runs `Promise.all([saveSpecGroups, saveImages])` and then
navigates away without checking whether either failed. Make both functions return an error
string (or throw), and only `router.push` when both succeed; otherwise `setError` and stay
on the page with `setSaving(false)`.

## Edge cases a weaker model would miss

1. **Renaming or deleting a variant orphans keys in `values`.** If the admin removes
   variant "1500 RPM", rows may still hold `values["1500 RPM"]`. `SpecReadout` iterates
   `variants`, not `values` keys, so orphans are invisible but persist. On save, filter
   each row's `values` to keys present in the current `variants` array.
2. **A row can legitimately have BOTH `value` and `values` — do not make them exclusive.**
   The public renderer prefers `values` when variants exist; keep that behavior. But if
   the product has NO variants, drop `values` entirely on save.
3. **Empty-string vs null:** the DB column is nullable JSONB. Saving `{}` or
   `{"x": ""}` will make `SpecReadout` render an empty value cell (`row.values &&
   variants` is truthy for `{}`). That's why Step 4 prunes empties and coerces to `null`.
4. **Group ids in drafts are a mix of real DB uuids (loaded rows) and `Math.random()`
   strings (newly added via `uid()`).** Never send draft ids to the DB — the insert
   payload must omit `id` and let Postgres generate uuids. The current code already does
   this correctly; preserve that when batching.
5. **`existingRows` prop is the source for old data, but after one save the page's props
   are stale** — the form navigates away on success (`router.push` + `router.refresh()`),
   so this is safe. If you decide to keep the user on the page instead, you must re-fetch
   groups/rows; simpler to keep the navigate-away behavior.
6. **RLS:** all these writes go through the browser client as an authenticated user —
   policy `auth.role() = 'authenticated'` covers insert/delete on `spec_groups`,
   `spec_rows`, `product_images`. No schema change needed.

## Acceptance criteria

Setup: run against a Supabase project seeded with `supabase/schema.sql` + `seed.sql`
(the seed contains the variant product — the tapping machine with per-variant spec rows).

- [ ] Open the tapping machine in `/admin/products/[id]`: each spec row with per-variant
      data shows one input per variant, pre-filled with the seeded values.
- [ ] Click **Save changes** WITHOUT editing anything, then reload the public product page:
      the per-variant spec table renders identically to before the save (this is the exact
      scenario that destroys data today).
- [ ] Edit one variant value, save, and confirm the public page shows the new value for
      that variant only.
- [ ] Remove a variant chip, save, and confirm (via Supabase table editor or a select on
      `spec_rows`) that no row's `values` JSONB still contains the removed variant key.
- [ ] Simulate a save failure (e.g. temporarily rename the `spec_rows` table in a dev
      project, or disconnect network in devtools after submit): the form shows an error,
      stays on the page, and the product's previously saved specs are still intact in the
      DB.
- [ ] A product with no variants saves rows with `values = null` (verify in table editor).
- [ ] `npm run build` passes.
