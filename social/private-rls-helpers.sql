-- Isolate privileged RLS lookups from the exposed public Data API.
-- MangaLog Social Test only, after social/safe-friendship-responses.sql.
create schema if not exists social_private;
revoke all on schema social_private from public, anon;
grant usage on schema social_private to authenticated;

create or replace function social_private.is_blocked(a uuid,b uuid)
returns boolean language sql stable security definer set search_path = '' as $$
 select (auth.uid()=a or auth.uid()=b) and exists (
  select 1 from public.social_blocks bl
  where (bl.blocker_id=a and bl.blocked_id=b)
   or (bl.blocker_id=b and bl.blocked_id=a)
 );
$$;
revoke all on function social_private.is_blocked(uuid,uuid) from public,anon;
grant execute on function social_private.is_blocked(uuid,uuid) to authenticated;

create or replace function social_private.are_friends(a uuid,b uuid)
returns boolean language sql stable security definer set search_path = '' as $$
 select (auth.uid()=a or auth.uid()=b) and exists (
  select 1 from public.social_friend_requests r
  where r.status='accepted' and
   ((r.sender_id=a and r.receiver_id=b) or (r.sender_id=b and r.receiver_id=a))
 ) and not exists (
  select 1 from public.social_blocks bl
  where (bl.blocker_id=a and bl.blocked_id=b)
   or (bl.blocker_id=b and bl.blocked_id=a)
 );
$$;
revoke all on function social_private.are_friends(uuid,uuid) from public,anon;
grant execute on function social_private.are_friends(uuid,uuid) to authenticated;

alter policy "Profiles visible to authenticated users" on public.social_profiles
using (user_id=(select auth.uid()) or not social_private.is_blocked(user_id,(select auth.uid())));

alter policy "Requests participants read" on public.social_friend_requests
using ((sender_id=(select auth.uid()) or receiver_id=(select auth.uid()))
 and not social_private.is_blocked(sender_id,receiver_id));

alter policy "Send pending request" on public.social_friend_requests
with check (sender_id=(select auth.uid()) and status='pending'
 and not social_private.is_blocked(sender_id,receiver_id)
 and not social_private.are_friends(sender_id,receiver_id));

alter policy "Recipient responds only while pending" on public.social_friend_requests
using (receiver_id=(select auth.uid()) and status='pending'
 and not social_private.is_blocked(sender_id,receiver_id))
with check (receiver_id=(select auth.uid()) and status in ('accepted','declined')
 and not social_private.is_blocked(sender_id,receiver_id));

alter policy "Posts audience read" on public.social_posts
using (author_id=(select auth.uid()) or
 (not social_private.is_blocked(author_id,(select auth.uid()))
  and (audience='public' or social_private.are_friends(author_id,(select auth.uid())))));

alter policy "Read collection only when permitted" on public.social_collection_volumes
using (user_id=(select auth.uid()) or (
 not social_private.is_blocked(user_id,(select auth.uid())) and exists (
 select 1 from public.social_profiles p where p.user_id=social_collection_volumes.user_id
 and (p.collection_visibility='public'
 or (p.collection_visibility='friends' and social_private.are_friends((select auth.uid()),p.user_id)))
 )));

alter policy "Visible comments read" on public.social_comments
using (not social_private.is_blocked(author_id,(select auth.uid()))
 and exists(select 1 from public.social_posts p where p.id=post_id));

alter policy "Visible likes read" on public.social_likes
using (not social_private.is_blocked(user_id,(select auth.uid()))
 and exists(select 1 from public.social_posts p where p.id=post_id));

drop function public.social_are_friends(uuid,uuid);
drop function public.social_is_blocked(uuid,uuid);
