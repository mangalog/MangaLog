-- MangaLog Next TEST: opt-in automatic Social snapshot from the SAME test Collection.
-- Never run this in the official MangaLog production Supabase project.
alter table public.social_profiles
 add column if not exists auto_sync_enabled boolean not null default false;

-- No volume is disclosed if the user has not explicitly enabled sharing.
alter policy "Read collection only when permitted" on public.social_collection_volumes
 using (user_id=(select auth.uid()) or (
 not social_private.is_blocked(user_id,(select auth.uid())) and exists (
   select 1 from public.social_profiles p
   where p.user_id=social_collection_volumes.user_id
     and p.auto_sync_enabled = true
     and (p.collection_visibility='public' or
         (p.collection_visibility='friends' and social_private.are_friends((select auth.uid()),p.user_id)))
 )));

create or replace function public.social_sync_owned_volumes(rows jsonb)
returns integer language plpgsql security invoker set search_path = '' as $$
declare
 u uuid := (select auth.uid());
 v_count integer;
begin
 if u is null then raise exception 'Authentication required'; end if;
 if not exists(select 1 from public.social_profiles p where p.user_id=u and p.auto_sync_enabled=true)
 then raise exception 'Collection sync not enabled by owner'; end if;
 if rows is null or jsonb_typeof(rows)<>'array' then raise exception 'Expected an array'; end if;
 v_count := jsonb_array_length(rows);
 if v_count > 5000 then raise exception 'Too many volumes for single sync'; end if;
 if exists(
   select 1 from jsonb_array_elements(rows) r where
   jsonb_typeof(r)<>'object'
   or jsonb_typeof(r->'series_key')<>'string'
   or jsonb_typeof(r->'series_title')<>'string'
   or length(r->>'series_key') not between 1 and 160
   or length(r->>'series_title') not between 1 and 200
   or (r->>'volume_number') !~ '^[0-9]{1,5}$'
   or (r->>'volume_number')::integer not between 1 and 10000
 ) then raise exception 'Invalid volume payload'; end if;
 insert into public.social_collection_volumes (user_id,series_key,series_title,volume_number)
 select u,r->>'series_key',r->>'series_title',(r->>'volume_number')::integer
 from jsonb_array_elements(rows) r
 on conflict (user_id,series_key,volume_number) do update
   set series_title=excluded.series_title;
 delete from public.social_collection_volumes v
 where v.user_id=u
 and not exists(
  select 1 from jsonb_array_elements(rows) r
  where r->>'series_key'=v.series_key
  and (r->>'volume_number')::integer=v.volume_number
 );
 return v_count;
end;
$$;
revoke all on function public.social_sync_owned_volumes(jsonb) from public,anon;
grant execute on function public.social_sync_owned_volumes(jsonb) to authenticated;