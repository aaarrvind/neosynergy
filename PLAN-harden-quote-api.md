# PLAN: Harden the quote/contact API against abuse and duplicate-send bugs

**Rank: 4 of 5.**

## Goal

[app/api/quote/route.ts](app/api/quote/route.ts) is a public, unauthenticated endpoint
that sends TWO emails per request — one to sales, and one **to any address the caller
supplies** (`contact.email`). It has no rate limiting, no payload size limits, and no bot
protection, which makes it (a) an outbound-spam vector through the company's verified
Resend domain, and (b) a way to burn the Resend quota. It also has a duplicate-send bug:
the two `resend.emails.send` calls run sequentially, and if the second fails the client
gets a 502 and retries — re-sending the sales email each time. Fix validation, add cheap
abuse resistance, and fix the send semantics.

## Files to touch

1. `app/api/quote/route.ts` — validation, limits, rate limiting, send semantics
2. `components/QuoteForm.tsx` — honeypot field
3. `components/ContactForm.tsx` — honeypot field

No new dependencies. Rate limiting is in-memory (fine for a single-instance deploy; note
the serverless caveat in Edge cases).

## Implementation order

### Step 1 — Server-side payload validation (`app/api/quote/route.ts`)

After the existing name/email checks (lines 109–121), add a sanitization pass that builds
a trusted copy of the input instead of using it raw:

- Field length caps (truncate or reject with 400 — reject is simpler to verify):
  `name` ≤ 200, `company` ≤ 200, `email` ≤ 320, `phone` ≤ 50, `country` ≤ 100,
  `message` ≤ 5000 chars. All must be strings (`typeof x === "string"`), else 400.
- Items: reject with 400 if `items.length > 50`. For each item require
  `typeof item.name === "string"` (≤ 300 chars) and `typeof item.categoryName === "string"`
  (≤ 200); coerce `quantity` with
  `Math.min(999, Math.max(1, Math.floor(Number(item.quantity) || 1)))`;
  cap `notes` at 500 chars and `variant` at 200 (truncate is fine here).
  Never trust `item.image`/`item.id` — they are not used in the emails today; do not add
  them.
- If `items.length === 0` **and** `message` is empty/whitespace, return 400
  ("Please add items or a message.") — today an empty enquiry sends two near-empty emails.

### Step 2 — Honeypot

- In `components/QuoteForm.tsx` and `components/ContactForm.tsx`, add a visually hidden
  text input to the form:

  ```tsx
  <input type="text" name="website" tabIndex={-1} autoComplete="off"
         className="hidden" aria-hidden="true" />
  ```

  and include `website: String(form.get("website") || "")` in the posted `contact` object.
- In the API route: if `contact.website` is a non-empty string, return
  `NextResponse.json({ ok: true })` **without sending anything** (pretend success so bots
  don't adapt). Strip the field before building emails.

### Step 3 — In-memory rate limiting

Module scope in `app/api/quote/route.ts`:

```ts
const hits = new Map<string, number[]>(); // ip -> timestamps (ms)
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
```

At the top of `POST`: derive the caller key from
`request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"`. Prune
timestamps older than the window, push `Date.now()`, and if the count exceeds
`MAX_PER_WINDOW`, return 429 with
`{ error: "Too many requests. Please try again later or email us directly." }`.
Also prune the map when it exceeds ~10k keys (delete oldest entries) so memory is bounded.

### Step 4 — Fix send semantics

Replace the current sequential sends inside one try/catch (lines 146–170) with:

1. Send the **sales** email first. If it fails → log, return 502 (current message is fine).
   This is the send that matters; a retry after this failure is safe because nothing was
   delivered.
2. Send the **customer confirmation** second, in its own try/catch. If it fails → `console.error`
   and **still return `{ ok: true }`** (the business already received the lead; failing the
   whole request would cause duplicate sales emails on retry, and `QuoteForm` would keep
   the cart and re-submit).

### Step 5 — Frontend double-submit guard

`QuoteForm.tsx` already disables the button while `status === "submitting"` — verify
`ContactForm.tsx` does the same (it does, line 90). No change needed beyond the honeypot;
just confirm.

## Edge cases a weaker model would miss

1. **The customer-confirmation email is the spam vector, not the sales email.** Sales
   emails go to fixed addresses; the confirmation goes to attacker-controlled
   `contact.email` with attacker-controlled `name`, `message`, and item names embedded.
   The length caps + rate limit are what contain this — don't skip them because "it's
   just a contact form."
2. **Retry semantics decide duplicate emails.** Returning 502 after the sales email
   succeeded (current behavior) means every user retry duplicates the lead AND the user's
   cart never clears (QuoteForm only clears on ok). Step 4's ordering is the fix; keep it.
3. **In-memory rate limiting resets per serverless instance.** On Vercel, each lambda has
   its own `Map`, so the real-world limit is per-instance, not global. That is an accepted
   trade-off for this task — leave a one-line comment saying so. Do NOT add Redis/Upstash
   or any new dependency.
4. **`x-forwarded-for` can be absent locally** (key `"unknown"`), which would rate-limit
   all local traffic together — acceptable; mention in the comment. Don't crash on a
   missing header.
5. **`escapeHtml` (line 22) does not escape single quotes** — it's used inside HTML text
   nodes and double-quoted attributes only, so it's safe as-is. Don't "improve" the email
   templates; the only injection surfaces are already escaped. But the honeypot/limits
   must apply BEFORE any HTML building.
6. **Keep the no-API-key dev path** (lines 134–138: logs the submission and returns
   `mode: "logged"`). Rate limiting and validation must run before it, so dev behaves like
   prod except for the actual send.
7. **`quantity` arrives from localStorage via the client** — the UI clamps to ≥1, but the
   API can be called directly with `quantity: 1e9` or `-5` or `"abc"`. The coercion in
   Step 1 must handle all three (the given formula does).

## Acceptance criteria

Test locally with `RESEND_API_KEY` unset (submissions are logged, not sent).

- [ ] `curl -X POST localhost:3000/api/quote -H 'Content-Type: application/json' -d '{"contact":{"name":"A","email":"a@b.co"},"items":[{"name":"X","categoryName":"C","quantity":-5}]}'`
      → 200, and the logged item shows `quantity: 1`. Same with `"quantity": 1e9` → `999`.
- [ ] Payload with a 10,000-char `message` → 400. Payload with 51 items → 400.
- [ ] Payload with `"website": "http://spam"` in `contact` → 200 `{ ok: true }` but
      **nothing** logged/sent.
- [ ] 6 rapid valid POSTs from the same client → the 6th returns 429.
- [ ] Empty enquiry (`items: []`, empty `message`) → 400.
- [ ] Real browser flow still works: add product → cart drawer → /quote → submit → success
      panel shows and cart empties; contact form on /contact submits successfully.
- [ ] With a real `RESEND_API_KEY` and a deliberately invalid customer email domain (or by
      stubbing the second send to throw), the API still returns 200 and logs the
      confirmation failure — no 502, no duplicate sales email on retry.
- [ ] `npm run build` passes.
