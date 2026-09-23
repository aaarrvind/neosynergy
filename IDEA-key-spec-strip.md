# Idea: key-spec strip on the product page

**Status:** not started — parked for later
**Raised:** 2026-09-23, while redesigning the specification table (commit `ee5c02f`)

## What it is

A short row of headline specifications directly under the product hero, above
the long specification table. Large numerals, small uppercase labels.

Haas do this on every machine page, e.g. on the VF-2:

```
   40          3          8.1k         20
 TAPER       AXIS         RPM     TOOL CAPACITY
```

It answers "is this roughly the right machine?" in about two seconds, without
scrolling to the full sheet. Mazak do a lighter version of the same thing: a
three-row summary (tool shank / max spindle speed / table size) on each model
card, with a "Machine Specifications" link to the detail.

Reference pages:
- <https://www.haascnc.com/machines/vertical-mills/vf-series/models/small/vf-2.html>
- <https://www.mazak.com/us-en/products/vc-ez/>

## Why it was parked rather than built

Choosing *which* specs are the headline ones is an editorial decision, not a
technical one, and two questions need an answer from the client first:

1. **Which specs matter per product type?** The right four for a machining
   centre (travel, spindle taper, rpm, tool capacity) are not the right four
   for a coolant pump or a carbide insert.
2. **What do you show for a spec that differs between variants?** A single
   number would be wrong, and two numbers in a strip meant for glancing is
   clutter.

## Proposed approach (no schema change)

Derive the strip from data that already exists and that the admin already
controls:

- Take the **first row of each of the first four spec groups**.
- **Skip any row that has per-variant values** (`row.values` is set) and fall
  through to the next row in that group; if a whole group has nothing shared,
  skip the group.
- If fewer than three specs survive, **render nothing** — a strip of one or two
  items looks broken.

Group order and row order within a group are both already admin-controlled, so
the client curates the strip implicitly by ordering the spec builder. On VMC 850
this yields Table size, X/Y/Z travel, Spindle taper, Rapid feed — genuinely the
headline numbers.

### Alternative if that proves too blunt

Add `is_key_spec boolean` to `spec_rows` with a checkbox in `SpecBuilder`, and
cap the strip at four. More control, but more admin work per product and a
migration. Only worth it if the heuristic above picks badly across the real
catalogue — revisit once there are more than a handful of products.

## Files this would touch

- `components/KeySpecStrip.tsx` — new; pure presentation, takes `SpecGroup[]`
- `lib/specs.ts` — new, or a helper inside the component: the selection rule
  above, so it is unit-testable and not buried in JSX
- `app/products/[[...slug]]/page.tsx` — render between the hero section and the
  `{/* Specs */}` section
- `app/globals.css` — `.key-spec` styles if the numerals need mono +
  `tabular-nums` beyond what Tailwind gives

## Edge cases a weaker implementation would miss

- **Products with no spec groups at all** (most of the catalogue today) — the
  strip must not render an empty container or a stray divider.
- **Values are free text, not numbers.** `"7.5 / 11 kW GSK servo spindle unit"`
  is a legitimate value and will blow out a large-numeral layout. Either cap
  the strip to values under ~14 characters, or let the type scale down for long
  values — do not truncate a spec with an ellipsis, a half-shown figure is
  worse than no figure.
- **Label length.** `"T-slot (width x number x distance)"` is a fine table label
  and a terrible strip label. Consider showing only the text before the first
  bracket.
- **Mobile.** Four items do not fit across 375px. Two-up grid, not a horizontal
  scroller — a strip you have to swipe defeats the glanceable purpose.
- **Do not duplicate the tagline.** The hero already carries a one-line summary;
  the strip sits below it and must not repeat the same figures.

## Acceptance criteria

- [ ] VMC 850 and VMC 650 both show a strip of 3–4 specs above the spec table.
- [ ] No strip renders on a product without spec groups (e.g. carbide insert).
- [ ] No spec that differs between variants ever appears in the strip.
- [ ] At 375px wide the strip wraps to a grid with no horizontal scrolling and
      no clipped text.
- [ ] Removing a spec group in the admin panel changes the strip on the next
      revalidation, with no code change.
