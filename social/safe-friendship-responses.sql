-- MangaLog Social Test (progetto separato da quello online).
-- La risposta alle amicizie non richiede più una RPC SECURITY DEFINER.
-- Solo il destinatario può aggiornare la richiesta ancora in sospeso.
create unique index if not exists social_friend_unique_pair_idx
on public.social_friend_requests (least(sender_id,receiver_id),greatest(sender_id,receiver_id));
create policy "Recipient responds only while pending"
on public.social_friend_requests for update to authenticated
using (receiver_id=(select auth.uid()) and status='pending'
 and not public.social_is_blocked(sender_id,receiver_id))
with check (receiver_id=(select auth.uid()) and status in ('accepted','declined')
 and not public.social_is_blocked(sender_id,receiver_id));
grant update(status,updated_at) on table public.social_friend_requests to authenticated;
drop function if exists public.social_respond_to_request(uuid,text);
