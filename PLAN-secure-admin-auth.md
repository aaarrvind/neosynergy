# PLAN: Secure the admin auth layer (unverified sessions gate service-role operations)

**Rank: 2 of 5.**

## Goal

Every admin gate in this app trusts `supabase.auth.getSession()`, which reads the JWT out
of the cookie **without verifying it against the Supabase Auth server**. Supabase's own
docs say never to trust `getSession()` in server code. The worst instance:
[app/api/admin/team/route.ts](app/api/admin/team/route.ts) accepts a `getSession()` result
and then performs **service-role** operations (`listUsers`, `inviteUserByEmail`,
`deleteUser`) — a forged/expired cookie could enumerate, create, and delete admin accounts.
Replace all server-side `getSession()` checks with `getUser()` (which revalidates the token
with Supabase) and add sanity guards to the team API.

## Files to touch

1. `middleware.ts`
2. `app/(admin-shell)/admin/layout.tsx`
3. `app/api/admin/team/route.ts`

## Implementation order

### Step 1 — `middleware.ts` (line 36)

Replace:

```ts
const { data: { session } } = await supabase.auth.getSession();
```

with:

```ts
const { data: { user } } = await supabase.auth.getUser();
```

and update the two conditions below it (`isAdminPath && !session` → `isAdminPath && !user`;
`isLoginPath && session` → `isLoginPath && user`).

Also narrow the middleware's work: the current matcher runs Supabase auth on **every**
request (all public pages, all API routes). Keep the matcher as-is (the
`x-next-pathname` header is needed site-wide by `app/layout.tsx`), but only do the auth
round-trip when it matters. Restructure so that when
`!isAdminPath && !isLoginPath`, the middleware sets the pathname header and returns
immediately without creating a Supabase client. This avoids an auth-server HTTP call on
every public page view (`getUser()` is a network call, unlike `getSession()`).

### Step 2 — `app/(admin-shell)/admin/layout.tsx` (lines 20–24)

Same replacement:

```ts
const { data: { user } } = await supabase.auth.getUser();
if (!user) redirect("/admin-login");
```

This is the defense-in-depth layer if middleware is bypassed (e.g. matcher gaps).

### Step 3 — `app/api/admin/team/route.ts`

- Change `requireAuth()` to:

```ts
async function requireAuth() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
```

  and update all three handlers (`GET`, `POST`, `DELETE`) from `session` to `user`.

- **DELETE self-lockout guard:** in the `DELETE` handler, the authenticated user must not
  delete their own account if they are the last user. Minimum viable guard: fetch
  `listUsers()` first; if the target `id === user.id` and `data.users.length === 1`,
  return 400 with `{ error: "Cannot delete the last admin user." }`. (Deleting yourself
  when other admins exist is allowed — the UI at `app/(admin-shell)/admin/team/page.tsx`
  already confirms before deleting; you do not need to change the UI.)

- **POST email validation:** validate the invited email with the same regex used in
  [app/api/quote/route.ts:20](app/api/quote/route.ts:20)
  (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) before calling `inviteUserByEmail`; return 400 on
  failure.

- Wrap `await req.json()` in the POST handler in try/catch → return 400 on malformed JSON
  (currently an unparseable body throws and returns a 500 with a stack in dev logs).

### Step 4 — Rebuild and test

`npm run build` must pass (typecheck runs during build; there is no separate test suite).

## Edge cases a weaker model would miss

1. **`getUser()` is a network call.** Putting it unconditionally in middleware that matches
   every route adds latency to every public page. That's why Step 1 short-circuits for
   non-admin paths *before* creating the client. Don't "simplify" by removing the
   short-circuit.
2. **The middleware `isConfigured` escape hatch (middleware.ts:12–18) lets everything
   through when Supabase env vars are missing — including `/admin`.** That is intentional
   for local dev, and `app/(admin-shell)/admin/layout.tsx` mirrors the same check. Keep
   the behavior, but keep both layers consistent: if you touch the check, it must remain
   identical in both files.
3. **Do not swap `getUser()` into client components.** `app/(admin-shell)/admin-login/page.tsx`
   and `components/admin/AdminNav.tsx` use the browser client (`signInWithPassword`,
   `signOut`) — those are fine and out of scope.
4. **Cookie refresh side-effects:** `getUser()` may refresh the token, which triggers the
   `setAll` cookie callback. The middleware's `setAll` implementation recreates `response`
   — this pattern is already correct; don't restructure it, just swap the call.
5. **`x-next-pathname` is set on the response, and a client can send it as a request
   header.** `app/layout.tsx` reads it via `headers()` (request headers), so a visitor
   sending `x-next-pathname: /admin` on a public URL can suppress the site Header/Footer.
   It's cosmetic, not a security hole (admin auth doesn't depend on it), but while you're
   in `middleware.ts`, forward the header properly on the *request*:
   create `const requestHeaders = new Headers(request.headers); requestHeaders.set("x-next-pathname", pathname);`
   and pass `{ request: { headers: requestHeaders } }` to every `NextResponse.next()` /
   let redirects skip it. This both fixes spoofing (overwrites any client-sent value) and
   makes the layout's read reliable.
6. **RLS is the real data-write barrier and is unaffected:** admin CRUD from client
   components goes through the anon-key browser client where Supabase verifies the JWT
   server-side. The vulnerability is specifically the service-role team route and page
   gating — don't waste time changing RLS policies or the schema.

## Acceptance criteria

- [ ] `grep -rn "getSession" app lib middleware.ts components` returns **zero** matches in
      server code (middleware, admin layout, API routes). Client-side auth calls
      (`signInWithPassword`, `signOut`) are unchanged.
- [ ] Logged out: `curl -i localhost:3000/admin` returns a 307/308 redirect to
      `/admin-login`; `curl -i localhost:3000/api/admin/team` returns 401.
- [ ] With a fabricated cookie (e.g. copy a real Supabase auth cookie, tamper with one
      character of the JWT payload, replay it): `/api/admin/team` returns 401, not user
      data.
- [ ] Logged in via `/admin-login`, the Team page (`/admin/team`) still lists, invites
      (valid email), and deletes users; inviting `not-an-email` returns 400; deleting the
      only remaining user returns 400 with the lockout message.
- [ ] Public pages (`/`, `/products`) still load with Supabase env vars unset
      (`NEXT_PUBLIC_SUPABASE_URL=placeholder`).
- [ ] `npm run build` passes with no type errors.
