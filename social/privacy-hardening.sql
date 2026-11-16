-- MangaLog Social vNext / privacy hardening
-- Eseguire solo sul Supabase TEST, dopo schema.sql e collection-compare.sql.
-- La funzione SECURITY DEFINER vede i blocchi di entrambe le parti,
-- evitando che le policy RLS nascondano blocchi creati dall'altro utente.
create or replace function public.social_is_blocked(a uuid,b uuid)
returns boolean language sql stable security definer set search_path = '' as $$
 select (auth.uid()=a or auth.uid()=b) and exists (
   select 1 from public.social_blocks bl
   where (bl.blocker_id=a and bl.blocked_id=b)
      or (bl.blocker_id=b and bl.blocked_id=a)
 );
$$;
revoke all on function public.social_is_blocked(uuid,uuid) from public;
grant execute on function public.social_is_blocked(uuid,uuid) to authenticated;

drop policy if exists "Profiles visible to authenticated users" on public.social_profiles;
create policy "Profiles visible to authenticated users"
on public.social_profiles for select to authenticated
using (user_id=auth.uid() or not public.social_is_blocked(user_id,auth.uid()));

drop policy if exists "Requests participants read" on public.social_friend_requests;
create policy "Requests participants read"
on public.social_friend_requests for select to authenticated
using ((sender_id=auth.uid() or receiver_id=auth.uid())
 and not public.social_is_blocked(sender_id,receiver_id));

drop policy if exists "Send pending request" on public.social_friend_requests;
create policy "Send pending request"
on public.social_friend_requests for insert to authenticated
with check(sender_id=auth.uid() and status='pending'
 and not public.social_is_blocked(sender_id,receiver_id)
 and not public.social_are_friends(sender_id,receiver_id));

drop policy if exists "Posts audience read" on public.social_posts;
create policy "Posts audience read"
on public.social_posts for select to authenticated
using (author_id=auth.uid() or
 (not public.social_is_blocked(author_id,auth.uid())
  and (audience='public' or public.social_are_friends(author_id,auth.uid()))));

drop policy if exists "Read collection only when permitted" on public.social_collection_volumes;
create policy "Read collection only when permitted"
on public.social_collection_volumes for select to authenticated
using (user_id=auth.uid() or (
 not public.social_is_blocked(user_id,auth.uid()) and exists (
 select 1 from public.social_profiles p where p.user_id=social_collection_volumes.user_id
 and (p.collection_visibility='public'
 or (p.collection_visibility='friends' and public.social_are_friends(auth.uid(),p.user_id)))
 )));

-- Restringe l'interrogazione delle amicizie alle coppie di cui fa parte l'utente autenticato.
create or replace function public.social_are_friends(a uuid,b uuid)
returns boolean language sql stable security definer set search_path = '' as $$
 select (auth.uid()=a or auth.uid()=b) and exists (
   select 1 from public.social_friend_requests r
   where r.status='accepted' and
   ((r.sender_id=a and r.receiver_id=b) or
    (r.sender_id=b and r.receiver_id=a))
 ) and not exists (
   select 1 from public.social_blocks bl
   where (bl.blocker_id=a and bl.blocked_id=b)
      or (bl.blocker_id=b and bl.blocked_id=a)
 );
$$;
revoke all on function public.social_are_friends(uuid,uuid) from public;
grant execute on function public.social_are_friends(uuid,uuid) to authenticated;

-- I contenuti di utenti che ti hanno bloccato (o che hai bloccato)
-- non appaiono nemmeno come autori di commenti o like.
drop policy if exists "Visible comments read" on public.social_comments;
create policy "Visible comments read"
on public.social_comments for select to authenticated
using (
 not public.social_is_blocked(author_id,auth.uid())
 and exists(select 1 from public.social_posts p where p.id=post_id)
);
drop policy if exists "Visible likes read" on public.social_likes;
create policy "Visible likes read"
on public.social_likes for select to authenticated
using (
 not public.social_is_blocked(user_id,auth.uid())
 and exists(select 1 from public.social_posts p where p.id=post_id)
);
