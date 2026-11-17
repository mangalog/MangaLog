-- Test-only MangaLog Next collection. Identical payload shape to current collection code.
-- Do NOT run this migration in the production Supabase project.
create table if not exists public.mangalog_collections(
 user_id uuid primary key references auth.users(id) on delete cascade,
 payload jsonb not null default '{"series":[],"wishlist":[],"activity":[],"links":[]}'::jsonb,
 revision bigint not null default 1 check(revision >= 1),
 updated_at timestamptz not null default now(),
 constraint mangalog_collections_payload_object check (jsonb_typeof(payload)='object')
);
alter table public.mangalog_collections enable row level security;
revoke all on public.mangalog_collections from public,anon,authenticated;
grant select,insert,update on public.mangalog_collections to authenticated;
drop policy if exists "Next owner read collection" on public.mangalog_collections;
drop policy if exists "Next owner insert collection" on public.mangalog_collections;
drop policy if exists "Next owner update collection" on public.mangalog_collections;
create policy "Next owner read collection" on public.mangalog_collections
 for select to authenticated using(user_id=(select auth.uid()));
create policy "Next owner insert collection" on public.mangalog_collections
 for insert to authenticated with check(user_id=(select auth.uid()));
create policy "Next owner update collection" on public.mangalog_collections
 for update to authenticated
 using(user_id=(select auth.uid()))
 with check(user_id=(select auth.uid()));
