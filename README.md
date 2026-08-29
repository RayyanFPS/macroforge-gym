# MacroForge v6 — Global Search + Authentication Fix

## Global search

The previous build could show "Global database unavailable" because it tried
the POST Search-a-licious endpoint first. In v6 the browser uses the documented
GET `/search` endpoint first, which avoids a browser preflight in common
VS Code Live Server setups, and then falls back to Open Food Facts legacy
full-text search.

Important: Open Food Facts v2 `/api/v2/search` is not a full-text endpoint.
MacroForge does not use it for plain food-name searching.

Search examples:
- oreo
- croissant
- pizza
- banana
- pasta
- steak
- cereal
- yogurt
- protein bar
- coca cola
- lays

The search layer:
- searches the full global database
- prefers English product-name fields
- handles products whose language tag is wrong when the product name itself
  matches the English query
- supports exact phrase boosting
- rejects unrelated products
- converts kJ to kcal when kcal is absent
- cancels stale searches
- keeps local Pakistani foods visible

## Login / Create account

`auth.html` now contains:
- Email/password login
- Email/password account creation
- Password reset email
- Mobile-responsive authentication UI
- Supabase session handling

`supabase-config.js` contains:
- Supabase project URL
- Supabase publishable/anon key placeholder

Do NOT put a Supabase `service_role` key in browser code.

### Enable real accounts

1. Open `supabase-config.js`.
2. Replace `PASTE_YOUR_SUPABASE_PUBLISHABLE_KEY_HERE` with the project's
   publishable/anon key.
3. In Supabase Auth, enable Email provider.
4. If you want Google login, enable Google under Auth Providers.
5. Add your deployed site URL to Supabase Auth redirect/site URL settings.
6. Run MacroForge through VS Code Live Server while testing.

Supabase's current JavaScript API supports `signUp()` for account creation,
`signInWithPassword()` for email/password login, OAuth providers, and persisted
sessions.

## Local data

Food/workout/water data remains in localStorage in this frontend version.
Supabase Auth gives users an account/session, but it does not automatically
sync MacroForge's local state between devices. The next backend step is to
store user profiles, food logs, hydration, workouts and progress in Supabase
Postgres using the authenticated user's ID.

## Important production note

Open Food Facts is an open/community-maintained database. Nutrition data can
be incomplete. Pakistani homemade-dish values should remain estimates unless
MacroForge calculates them from a recipe/ingredient database.


### Simple account mode
This build intentionally does not use email verification or Google/Supabase Auth. Accounts use a username + password and are stored in this browser's localStorage. This is suitable for the current prototype; for production/multi-device accounts, replace it with a real authentication backend later.
