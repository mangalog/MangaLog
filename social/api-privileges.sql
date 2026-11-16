-- Solo per MangaLog Social Test, eseguire dopo schema / compare / privacy-hardening.
-- Revoca esplicita dei permessi anon sulle RPC pubbliche.
revoke execute on function public.social_are_friends(uuid,uuid) from anon;
revoke execute on function public.social_is_blocked(uuid,uuid) from anon;
revoke execute on function public.social_respond_to_request(uuid,text) from anon;
revoke execute on function public.social_compare_collections(uuid) from anon;
-- Supporto UPSERT dei volumi, limitato al proprietario.
create policy "Update own snapshot" on public.social_collection_volumes
for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
grant update on public.social_collection_volumes to authenticated;
