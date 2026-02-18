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
for insert with check (auth.uid() = user_id);

-- Allow users to select their bookmarks
create policy "Users can select their bookmarks" on bookmarks
for select using (auth.uid() = user_id);

-- Allow users to update their bookmarks
create policy "Users can update their bookmarks" on bookmarks
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Allow users to delete their bookmarks
create policy "Users can delete their bookmarks" on bookmarks
for delete using (auth.uid() = user_id);

-- Note: Run this SQL in the Supabase SQL editor. Also enable
-- Google under Auth > Providers and configure the redirect URL
-- (https://your-vercel-domain.vercel.app or http://localhost:3000).
