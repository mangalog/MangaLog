-- SQL integration test, only for MangaLog Social Test; rolls back all test data.
begin;
insert into auth.users(id,email) values
 ('33333333-3333-4333-8333-333333333333','friend-test-a@example.invalid'),
 ('44444444-4444-4444-8444-444444444444','friend-test-b@example.invalid');
insert into public.social_profiles(user_id,username,display_name) values
 ('33333333-3333-4333-8333-333333333333','friend_test_a','Friend Test A'),
 ('44444444-4444-4444-8444-444444444444','friend_test_b','Friend Test B');
insert into public.social_friend_requests(id,sender_id,receiver_id) values
 ('55555555-5555-4555-8555-555555555555',
 '33333333-3333-4333-8333-333333333333',
 '44444444-4444-4444-8444-444444444444');
set local role authenticated;
select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
do $$declare n integer;begin
 update public.social_friend_requests set status='accepted',updated_at=now()
 where id='55555555-5555-4555-8555-555555555555';
 get diagnostics n=row_count;
 if n<>0 then raise exception 'Sender illegally accepted request'; end if;
end$$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','44444444-4444-4444-8444-444444444444',true);
do $$declare n integer;begin
 update public.social_friend_requests set status='accepted',updated_at=now()
 where id='55555555-5555-4555-8555-555555555555';
 get diagnostics n=row_count;
 if n<>1 then raise exception 'Receiver could not accept request'; end if;
end$$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
do $$begin
 if not public.social_are_friends(
 '33333333-3333-4333-8333-333333333333',
 '44444444-4444-4444-8444-444444444444') then
 raise exception 'Friendship not recognized';end if;
end$$;
reset role;
rollback;