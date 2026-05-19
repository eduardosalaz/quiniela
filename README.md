# Quiniela Mundial 2026

World Cup 2026 prediction pool. React + Vite frontend, Supabase backend (Postgres + magic-link auth + Edge Function), deployed on Cloudflare Pages.

Same features as the original JSX: predictions, leaderboard, knockout entry, admin PIN, CSV/JSON export, backup restore.

## Stack

- **Frontend:** React 18 + Vite (plain JS)
- **Auth:** Supabase magic-link (email-only, no passwords)
- **DB:** Supabase Postgres with Row Level Security
- **Live results:** Supabase Edge Function → [football-data.org](https://www.football-data.org/) free tier
- **Hosting:** Cloudflare Pages

## Local dev

```bash
npm install
cp .env.example .env.local   # fill in Supabase URL + anon key
npm run dev                  # http://localhost:5173
```

## Supabase setup (one-time)

1. Create a project at [supabase.com](https://supabase.com) (free tier is enough).
2. In **SQL Editor**, paste and run `supabase/migrations/0001_init.sql`. This creates the tables and RLS policies.
3. In **Authentication → Providers**, make sure **Email** is enabled and **Confirm email** is on. Disable any other providers you don't want.
4. In **Authentication → URL Configuration**, add your production URL (e.g. `https://quiniela.pages.dev`) to **Site URL** and to **Redirect URLs**. For local dev also add `http://localhost:5173`.
5. In **Project Settings → API**, copy:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

## Edge Function (live results)

1. Get a free API token at [football-data.org/client/register](https://www.football-data.org/client/register). Free tier gives 10 requests/min — more than enough.
2. Install the [Supabase CLI](https://supabase.com/docs/guides/cli).
3. Link and deploy:

   ```bash
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase secrets set FOOTBALL_DATA_TOKEN=your_token_here
   supabase functions deploy fetch-results
   ```

The Edge Function is what the admin **Buscar Resultados** button calls. Your token stays server-side.

> The free football-data.org tier only exposes some competitions. If "World Cup" isn't in your plan, fall back to manual entry in the admin tab — everything else still works.

## Deploy to Cloudflare Pages

1. Push this repo to GitHub.
2. In Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
3. Build settings:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output:** `dist`
   - **Environment variables:** add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
4. After the first deploy, copy the `*.pages.dev` URL into the Supabase **Site URL** + **Redirect URLs** (step 4 above), otherwise magic links will redirect to localhost.

## Sharing with friends

Send them the deploy URL. First time they open it:

1. Enter their email → click the magic link they receive.
2. Pick a display name (one-time).
3. Start predicting.

## Admin

- First person to click **Modo admin** sets the PIN (any 4 digits). Same PIN unlocks admin for anyone after that — same model as the original.
- Admin tab gives: backup restore, fetch live results, add knockout matches, manual score entry, full JSON export.
- The PIN is a UI gate, not a security boundary. Anyone authenticated can write results via the API — fine for a friends-only pool. Don't make this public.

## Schema reminder

| Table         | Purpose                                                         |
|---------------|-----------------------------------------------------------------|
| `players`     | One row per signed-up friend, keyed to `auth.users.id`          |
| `results`     | Final scores per `match_id` (group: `G{group}{md}{pi}`, KO: `KO{ts}`) |
| `knockouts`   | Knockout matches added by admin during the tournament           |
| `predictions` | One row per (player, match) — `home` / `away` / `draw`          |
| `config`      | Misc shared key/value; currently only `admin_pin`               |

## Resetting

To reset everything (e.g. after a test run), in the Supabase SQL editor:

```sql
truncate public.predictions, public.results, public.knockouts, public.config restart identity;
delete from public.players;
-- Delete auth users from Authentication → Users in the dashboard.
```
