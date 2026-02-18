# Supabase Setup Guide

This guide walks you through creating a Supabase project, enabling Google OAuth, and connecting your Smart Bookmark App.

---

## Step 1: Create a Supabase Project

1. Go to https://app.supabase.com
2. Sign up with GitHub or your email (Google sign-in also works).
3. Click **"New Project"** in the dashboard.
4. Fill in the project details:
   - **Name**: e.g., `smart-bookmark-app`
   - **Database Password**: Create a strong password (you won't need this often).
   - **Region**: Choose the region closest to you (e.g., US East for North America).
5. Click **"Create new project"**.
6. Wait for the project to initialize (2–3 minutes). You'll see a success message.

---

## Step 2: Get Your Supabase Credentials

Once your project is ready:

1. Go to **Settings** (bottom left) → **API**.
2. You'll see three keys:
   - **Project URL** — copy this as `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** — copy this as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** — keep this secret, do NOT expose in client-side code

Example values:
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 3: Create the Bookmarks Table and RLS Policies

1. Go to the **SQL Editor** (left sidebar).
2. Click **"New Query"**.
3. Copy and paste the entire SQL from `supabase/schema.sql`:

```sql
-- Supabase schema for Smart Bookmark App

-- 1) Create bookmarks table
create table if not exists bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  title text,
  url text not null,
  inserted_at timestamptz default now()
);

-- 2) Enable Row Level Security
alter table bookmarks enable row level security;

-- 3) Policies: allow authenticated users to CRUD only their rows
-- Allow users to insert rows where auth.uid() = user_id
create policy "Users can insert their bookmarks" on bookmarks
for insert using (auth.uid() = user_id);

-- Allow users to select their bookmarks
create policy "Users can select their bookmarks" on bookmarks
for select using (auth.uid() = user_id);

-- Allow users to update their bookmarks
create policy "Users can update their bookmarks" on bookmarks
for update using (auth.uid() = user_id);

-- Allow users to delete their bookmarks
create policy "Users can delete their bookmarks" on bookmarks
for delete using (auth.uid() = user_id);
```

4. Click **"Run"** to execute the SQL.
5. Go to **Table Editor** (left sidebar) and verify the `bookmarks` table exists.

---

## Step 4: Enable Google OAuth

### 4a. Get Google OAuth Credentials

1. Go to https://console.cloud.google.com
2. Create a new project (or use an existing one).
3. Go to **APIs & Services** → **Credentials**.
4. Click **"+ Create Credentials"** → **"OAuth client ID"**.
5. Choose **"Web application"**.
6. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (for local development)
   - `https://YOUR_VERCEL_DOMAIN.vercel.app/auth/callback` (for production, get this after deploying)
7. Click **"Create"** and copy the:
   - **Client ID** (e.g., `12345.apps.googleusercontent.com`)
   - **Client Secret** (keep this safe)

### 4b. Enable Google in Supabase

1. In your Supabase project, go to **Authentication** → **Providers**.
2. Find **Google** and click the toggle to enable it.
3. Paste your Google **Client ID** and **Client Secret** into the fields.
4. Click **"Save"**.

---

## Step 5: Configure Redirect URLs in Supabase

1. In **Authentication** → **URL Configuration**:
2. Under **Site URL**, add:
   - `http://localhost:3000` (for local development)
   - `https://YOUR_VERCEL_DOMAIN.vercel.app` (after deploying)
3. Under **Redirect URLs**, add:
   - `http://localhost:3000/auth/callback`
   - `https://YOUR_VERCEL_DOMAIN.vercel.app/auth/callback`
4. Click **"Save"**.

---

## Step 6: Connect Your App Locally

1. Clone or navigate to your project folder:

```bash
cd /Users/gowthamvantakula/Downloads/Assin
```

2. Create a `.env.local` file with your Supabase credentials:

```bash
cp .env.local.example .env.local
```

3. Edit `.env.local` and add:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. Install dependencies and run the app:

```bash
npm install
npm run dev
```

5. Open http://localhost:3000 in your browser.
6. Click **"Sign in with Google"** and test the OAuth flow.

---

## Step 7: Deploy to Vercel

1. Push your code to GitHub.
2. Go to https://vercel.com and import your repository.
3. Add Environment Variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **"Deploy"**.
5. Copy your Vercel domain (e.g., `smart-bookmark-app-xyz.vercel.app`).
6. Update Google OAuth redirect URIs:
   - In Google Cloud Console: add `https://smart-bookmark-app-xyz.vercel.app/auth/callback`
   - In Supabase: update **Site URL** and **Redirect URLs** with your Vercel domain.
7. Your app is now live!

---

## Troubleshooting

### "Sign in failed" or blank screen after Google redirect

- **Cause**: Redirect URI mismatch.
- **Fix**: Ensure the redirect URI in Google Cloud Console and Supabase **URL Configuration** matches your app's domain exactly.

### "403 Forbidden" when trying to add/delete bookmarks

- **Cause**: RLS policies not created or user is not authenticated.
- **Fix**: 
  1. Go to Supabase **Table Editor** → select `bookmarks` → click **RLS** and verify all 4 policies exist.
  2. Make sure you're logged in (click "Sign in with Google" first).

### Bookmarks don't sync in realtime across tabs

- **Cause**: Realtime subscriptions may need the Realtime feature enabled in Supabase.
- **Fix**: Go to **Database** → **Realtime** in Supabase and ensure the `bookmarks` table has Realtime enabled.

### Environment variables not loading in production

- **Cause**: Variables not set in Vercel.
- **Fix**: Go to Vercel **Project Settings** → **Environment Variables** and re-enter them. Redeploy after saving.

---

## Summary

- **Supabase URL & Anon Key**: Set as `NEXT_PUBLIC_*` environment variables.
- **Google OAuth**: Enable in Supabase → Providers, configure redirect URIs in both Google Cloud and Supabase.
- **Database**: Run `supabase/schema.sql` to create the `bookmarks` table with RLS policies.
- **Local Dev**: Use `.env.local` with your Supabase credentials and run `npm run dev`.
- **Production**: Deploy to Vercel, set env vars, and ensure redirect URIs are correct.

If you get stuck, check the Supabase docs: https://supabase.com/docs
