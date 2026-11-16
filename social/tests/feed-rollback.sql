-- Social feed RLS test; run only on Supabase TEST; all writes rolled back.
begin;
insert into auth.users(id,email) values
 ('66666666-6666-4666-8666-666666666666','feed-test-a@example.invalid'),
 ('77777777-7777-4777-8777-777777777777','feed-test-b@example.invalid'),
 ('88888888-8888-4888-8888-888888888888','feed-test-c@example.invalid');
insert into public.social_profiles(user_id,username,display_name) values
 ('66666666-6666-4666-8666-666666666666','feed_test_a','Feed Test A'),
 ('77777777-7777-4777-8777-777777777777','feed_test_b','Feed Test B'),
 ('88888888-8888-4888-8888-888888888888','feed_test_c','Feed Test C');
insert into public.social_posts(id,author_id,body,audience) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','66666666-6666-4666-8666-666666666666','Public post','public'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','66666666-6666-4666-8666-666666666666','Friends post','friends');
set local role authenticated;
select set_config('request.jwt.claim.sub','77777777-7777-4777-8777-777777777777',true);
do $$begin
 if (select count(*) from public.social_posts)<>1 then
 raise exception 'FAIL: non-friend sees friends post';end if;
end$$;
reset role;
insert into public.social_friend_requests(sender_id,receiver_id,status)
values ('66666666-6666-4666-8666-666666666666',
 '77777777-7777-4777-8777-777777777777','accepted');
set local role authenticated;
select set_config('request.jwt.claim.sub','77777777-7777-4777-8777-777777777777',true);
do $$begin
 if (select count(*) from public.social_posts)<>2 then
 raise exception 'FAIL: friend cannot read friends post';end if;
end$$;
insert into public.social_comments(post_id,author_id,body) values
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
 '77777777-7777-4777-8777-777777777777','Legitimate comment');
insert into public.social_likes(post_id,user_id) values
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
 '77777777-7777-4777-8777-777777777777');
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','88888888-8888-4888-8888-888888888888',true);
do $$begin
 if (select count(*) from public.social_posts)<>1 then
 raise exception 'FAIL: stranger sees friends post';end if;
 begin
  insert into public.social_comments(post_id,author_id,body) values
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
   '88888888-8888-4888-8888-888888888888','Forbidden comment');
  raise exception 'FAIL: stranger commented on hidden post';
 exception when insufficient_privilege then null;
 end;
 begin
  insert into public.social_likes(post_id,user_id) values
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
   '88888888-8888-4888-8888-888888888888');
  raise exception 'FAIL: stranger liked hidden post';
 exception when insufficient_privilege then null;
 end;
end$$;
reset role;
insert into public.social_blocks(blocker_id,blocked_id) values
 ('66666666-6666-4666-8666-666666666666',
 '77777777-7777-4777-8777-777777777777');
set local role authenticated;
select set_config('request.jwt.claim.sub','77777777-7777-4777-8777-777777777777',true);
do $$begin
 if (select count(*) from public.social_posts)<>0 then
 raise exception 'FAIL: blocked user still sees author posts';end if;
 if (select count(*) from public.social_comments)<>0 then
 raise exception 'FAIL: blocked user still sees comments on hidden posts';end if;
end$$;
reset role;
rollback;