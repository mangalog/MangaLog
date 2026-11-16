-- MangaLog Social vNext: lightweight text-only notifications (TEST DATABASE ONLY).
create table if not exists public.social_notifications (
 id uuid primary key default gen_random_uuid(),
 recipient_id uuid not null references public.social_profiles(user_id) on delete cascade,
 actor_id uuid not null references public.social_profiles(user_id) on delete cascade,
 kind text not null check (kind in ('friend_request','friend_accepted','post_comment','post_like')),
 target_id uuid not null,
 source_id uuid not null,
 read_at timestamptz,
 created_at timestamptz not null default now(),
 constraint notification_users_differ check (recipient_id<>actor_id),
 constraint notification_event_unique unique(recipient_id,actor_id,kind,source_id)
);
create index if not exists social_notifications_inbox_idx on public.social_notifications (recipient_id,created_at desc);
alter table public.social_notifications enable row level security;

revoke all on table public.social_notifications from public,anon,authenticated;
grant select, delete, update(read_at) on table public.social_notifications to authenticated;
create policy "Own visible notifications" on public.social_notifications
 for select to authenticated using (recipient_id=(select auth.uid())
 and not social_private.is_blocked(actor_id,(select auth.uid())));
create policy "Only owner marks notification read" on public.social_notifications
 for update to authenticated using (recipient_id=(select auth.uid())
 and not social_private.is_blocked(actor_id,(select auth.uid())))
 with check (recipient_id=(select auth.uid())
 and not social_private.is_blocked(actor_id,(select auth.uid())));
create policy "Only owner deletes notification" on public.social_notifications
 for delete to authenticated using (recipient_id=(select auth.uid()));

create or replace function social_private.emit_friend_notification()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
 if TG_OP='INSERT' and new.status='pending' then
  insert into public.social_notifications(recipient_id,actor_id,kind,target_id,source_id)
  values(new.receiver_id,new.sender_id,'friend_request',new.id,new.id)
  on conflict on constraint notification_event_unique do nothing;
 elsif TG_OP='UPDATE' and old.status='pending' and new.status='accepted' then
  insert into public.social_notifications(recipient_id,actor_id,kind,target_id,source_id)
  values(new.sender_id,new.receiver_id,'friend_accepted',new.id,new.id)
  on conflict on constraint notification_event_unique do nothing;
 end if;
 return new;
end; $$;
revoke all on function social_private.emit_friend_notification() from public,anon,authenticated;
drop trigger if exists social_friend_notifications on public.social_friend_requests;
create trigger social_friend_notifications after insert or update of status
on public.social_friend_requests for each row
execute function social_private.emit_friend_notification();

create or replace function social_private.emit_post_notification()
returns trigger language plpgsql security definer set search_path = '' as $$
declare recipient uuid;
declare actor uuid;
declare kind text;
declare source uuid;
begin
 if TG_TABLE_NAME='social_comments' then
  actor:=new.author_id;kind:='post_comment';source:=new.id;
 else
  actor:=new.user_id;kind:='post_like';source:=new.post_id;
 end if;
 select p.author_id into recipient from public.social_posts p where p.id=new.post_id;
 if recipient is not null and recipient<>actor then
  insert into public.social_notifications(recipient_id,actor_id,kind,target_id,source_id)
  values(recipient,actor,kind,new.post_id,source)
  on conflict on constraint notification_event_unique do nothing;
 end if;
 return new;
end; $$;
revoke all on function social_private.emit_post_notification() from public,anon,authenticated;
drop trigger if exists social_comment_notifications on public.social_comments;
drop trigger if exists social_like_notifications on public.social_likes;
create trigger social_comment_notifications after insert on public.social_comments for each row
execute function social_private.emit_post_notification();
create trigger social_like_notifications after insert on public.social_likes for each row
execute function social_private.emit_post_notification();
