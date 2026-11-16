begin;
insert into auth.users(id,email) values
('99999999-9999-4999-8999-999999999999','notifs-test-a@example.invalid'),
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaab','notifs-test-b@example.invalid');
insert into public.social_profiles(user_id,username,display_name) values
('99999999-9999-4999-8999-999999999999','notifs_a','Notifs A'),
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaab','notifs_b','Notifs B');
insert into public.social_friend_requests(id,sender_id,receiver_id) values
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
 '99999999-9999-4999-8999-999999999999',
 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaab');
insert into public.social_posts(id,author_id,body,audience) values
('cccccccc-cccc-4ccc-8ccc-cccccccccccc',
'99999999-9999-4999-8999-999999999999','First post','public');
insert into public.social_comments(post_id,author_id,body) values
('cccccccc-cccc-4ccc-8ccc-cccccccccccc',
'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaab','Great!');
insert into public.social_likes(post_id,user_id) values
('cccccccc-cccc-4ccc-8ccc-cccccccccccc',
'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaab');
update public.social_friend_requests set status='accepted'
where id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
do $$begin
 if (select count(*) from public.social_notifications)<>4 then
 raise exception 'FAIL: expected four notification events';end if;
end$$;
set local role authenticated;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaab',true);
do $$declare n integer;begin
 if (select count(*) from public.social_notifications)<>1 then
 raise exception 'FAIL: B sees other notifications';end if;
 update public.social_notifications set read_at=now()
 where recipient_id='99999999-9999-4999-8999-999999999999';
 get diagnostics n=row_count;
 if n<>0 then raise exception 'FAIL: B modified A notification';end if;
 update public.social_notifications set read_at=now();
 get diagnostics n=row_count;
 if n<>1 then raise exception 'FAIL: B cannot read own notification';end if;
end$$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','99999999-9999-4999-8999-999999999999',true);
do $$begin
 if (select count(*) from public.social_notifications)<>3 then
 raise exception 'FAIL: A does not see three notifications';end if;
end$$;
reset role;
insert into public.social_blocks(blocker_id,blocked_id) values
('99999999-9999-4999-8999-999999999999',
'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaab');
set local role authenticated;
select set_config('request.jwt.claim.sub','99999999-9999-4999-8999-999999999999',true);
do $$begin
 if (select count(*) from public.social_notifications)<>0 then
 raise exception 'FAIL: blocked actor notifications still visible';end if;
end$$;
reset role;
rollback;