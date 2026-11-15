-- Social vNext: snapshot espliciti, solo dati che l'utente sceglie di condividere.
-- Eseguire DOPO social/schema.sql in Supabase TEST. Non tocca le tabelle collezione.
create table if not exists public.social_collection_volumes (
 user_id uuid not null references public.social_profiles(user_id) on delete cascade,
 series_key text not null check(length(series_key) between 1 and 160),
 series_title text not null check(length(series_title) between 1 and 200),
 volume_number integer not null check(volume_number between 1 and 10000),
 created_at timestamptz not null default now(),
 primary key(user_id,series_key,volume_number)
);
create index if not exists social_collection_volumes_series_idx on public.social_collection_volumes(series_key,volume_number);
alter table public.social_collection_volumes enable row level security;
create policy "Read collection only when permitted" on public.social_collection_volumes
 for select to authenticated using (
  user_id=auth.uid() or (
    exists (
      select 1 from public.social_profiles p
      where p.user_id=social_collection_volumes.user_id
      and (p.collection_visibility='public'
        or (p.collection_visibility='friends' and public.social_are_friends(auth.uid(),p.user_id)))
    )
    and not exists (
      select 1 from public.social_blocks b
      where (b.blocker_id=auth.uid() and b.blocked_id=user_id)
      or (b.blocker_id=user_id and b.blocked_id=auth.uid())
    )
  )
 );
create policy "Insert own shared volumes" on public.social_collection_volumes
 for insert to authenticated with check(user_id=auth.uid());
create policy "Delete own shared volumes" on public.social_collection_volumes
 for delete to authenticated using(user_id=auth.uid());
-- Nessun automatismo: la raccolta esistente non viene mai copiata senza consenso.
-- Il confronto usa soltanto righe visibili secondo RLS.
create or replace function public.social_compare_collections(other_user uuid)
returns table(series_key text,series_title text,volume_number integer,
  mine boolean,theirs boolean)
language sql stable security invoker set search_path = '' as $$
 with a as (
  select v.series_key,v.series_title,v.volume_number
  from public.social_collection_volumes v where v.user_id=auth.uid()
 ), b as (
  select v.series_key,v.series_title,v.volume_number
  from public.social_collection_volumes v where v.user_id=other_user
 )
 select coalesce(a.series_key,b.series_key),
        coalesce(a.series_title,b.series_title),
        coalesce(a.volume_number,b.volume_number),
        a.volume_number is not null,b.volume_number is not null
 from a full outer join b on a.series_key=b.series_key
  and a.volume_number=b.volume_number
 where auth.uid() is not null and other_user<>auth.uid()
 order by 1,3
 limit 5000;
$$;
revoke all on function public.social_compare_collections(uuid) from public;
grant execute on function public.social_compare_collections(uuid) to authenticated;
