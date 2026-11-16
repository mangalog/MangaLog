-- RLS smoke test: MangaLog Social TEST ONLY. Everything is rolled back.
-- Run on separate Supabase test project after the four Social migrations.
begin;
do $$ begin
 if has_schema_privilege('anon','social_private','usage') or has_function_privilege('anon','social_private.are_friends(uuid,uuid)','execute')
 or has_function_privilege('anon','social_private.is_blocked(uuid,uuid)','execute')
 or has_function_privilege('anon','public.social_compare_collections(uuid)','execute')
 then raise exception 'Anonymous API privileges are unsafe';end if;
end $$;
insert into auth.users(id,email) values
 ('11111111-1111-4111-8111-111111111111','rollback-a@example.invalid'),
 ('22222222-2222-4222-8222-222222222222','rollback-b@example.invalid');
insert into public.social_profiles(user_id,username,display_name) values
 ('11111111-1111-4111-8111-111111111111','rollback_a','Rollback A'),
 ('22222222-2222-4222-8222-222222222222','rollback_b','Rollback B');
insert into public.social_collection_volumes(user_id,series_key,series_title,volume_number) values
 ('11111111-1111-4111-8111-111111111111','test::standard','Test Series',1),
 ('22222222-2222-4222-8222-222222222222','test::standard','Test Series',2);
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$begin
 if (select count(*) from public.social_collection_volumes)<>1 then
 raise exception 'Private volumes visible to unauthorized users';end if;
end $$;
reset role;
insert into public.social_friend_requests(sender_id,receiver_id,status)
values ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','accepted');
update public.social_profiles set collection_visibility='friends'
where user_id='22222222-2222-4222-8222-222222222222';
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$begin
 if (select count(*) from public.social_collection_volumes)<>2 then
 raise exception 'Friend cannot view shared snapshot';end if;
 if (select count(*) from public.social_compare_collections('22222222-2222-4222-8222-222222222222'))<>2 then
 raise exception 'Collection compare fails';end if;
end $$;
reset role;
insert into public.social_blocks(blocker_id,blocked_id)
values ('22222222-2222-4222-8222-222222222222','11111111-1111-4111-8111-111111111111');
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$begin
 if (select count(*) from public.social_collection_volumes)<>1 then
 raise exception 'Blocked user can read snapshot';end if;
 if exists(select 1 from public.social_profiles where user_id='22222222-2222-4222-8222-222222222222') then
 raise exception 'Blocked user can read profile';end if;
end $$;
reset role;
rollback;
