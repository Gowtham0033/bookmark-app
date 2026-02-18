# Smart Bookmark App (starter)

This workspace contains a minimal scaffold for the Smart Bookmark App assignment.

What I created:

- Minimal Next.js App Router scaffold in the `app/` directory
- Tailwind CSS configured (`tailwind.config.js`, `postcss.config.js`, and `app/globals.css`)
- Supabase client stub at `lib/supabaseClient.js` (reads from `NEXT_PUBLIC_` env vars)
- Basic `package.json` with scripts

Next steps to complete the assignment:

1. Create a Supabase project and enable Google OAuth.
2. Add backend tables (bookmarks) and RLS policies so bookmarks are private to each user.
3. Implement sign-in flow using Supabase Auth (Google OAuth only).
4. Implement CRUD endpoints/pages for bookmarks and wire up realtime subscriptions.
5. Deploy to Vercel and set environment variables.

Quick start (macOS / Linux):

```bash
cd /Users/gowthamvantakula/Downloads/Assin
npm install
npm run dev
```

Environment variables to set (Vercel / .env.local):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
If you want, I can now implement Google OAuth wiring and bookmarks CRUD next.

Supabase setup (recommended steps):

**See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed step-by-step instructions with screenshots and troubleshooting.**

Quick summary:
1. Create a new project at https://app.supabase.com/
2. Get your API credentials (Project URL, anon key) from Settings → API.
3. Go to SQL editor and run the SQL in `supabase/schema.sql` to create the `bookmarks` table and RLS policies.
4. Enable Google OAuth in Authentication → Providers with your Google Cloud Console credentials.
5. Configure redirect URLs in Authentication → URL Configuration.

Local development:

```bash
cp .env.local.example .env.local
# Edit .env.local and fill in your Supabase credentials (see SUPABASE_SETUP.md)
npm install
npm run dev
```

Notes about this scaffold:

- The app uses client-side Supabase auth and realtime subscriptions.
- Row Level Security (RLS) ensures bookmarks are private per-user; the client uses the anon key and RLS to restrict access.
- For production, deploy to Vercel and set the same environment variables there.

Next tasks already scaffolded in this repo:

- `components/SignInButton.jsx` — sign-in/sign-out using Google via Supabase.
- `components/BookmarksClient.jsx` — client UI for creating, listing, and deleting bookmarks with realtime updates.
- `supabase/schema.sql` — SQL to create the table and RLS policies.

If you'd like, I can also:

- Add tests, linting, or expand the UI.
- Create a PR-ready Vercel deployment config and CI.

Vercel deployment checklist

1. Create a new Vercel project and link to your GitHub repo.
2. Add the following Environment Variables in Vercel (Project Settings -> Environment Variables):
	- `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
	- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
3. Under Supabase Auth > Settings > Site URL add your Vercel URL and enable Google provider with proper OAuth credentials and redirect URIs.
4. Deploy the project from the `main` branch. The app will be available at your Vercel URL.

Troubleshooting

- If sign-in fails, check the redirect URIs both in Google Cloud Console and Supabase Auth provider settings.
- Use the Supabase SQL editor to verify the `bookmarks` table exists and RLS policies are created.
- For realtime issues, ensure you used the `@supabase/supabase-js` client and that the anon key is set in production.
