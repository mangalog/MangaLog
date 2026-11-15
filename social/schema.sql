-- MangaLog Social vNext - schema iniziale (NON eseguire sul database di produzione).
-- Eseguire solo su un progetto Supabase di TEST dopo backup e revisione.
create extension if not exists pgcrypto;
create table if not exists public.social_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 username text not null unique check (username ~ '^[a-z0-9_]{3,24}$'),
 display_name text not null check (char_length(display_name) between 1 and 60),
 bio text not null default '' check (char_length(bio)<=300),
 avatar_url text,
 collection_visibility text not null default 'private' check (collection_visibility in ('private','friends','public')),
 created_at timestamptz not null default now()
);
create table if not exists public.social_friend_requests (
 id uuid primary key default gen_random_uuid(),
 sender_id uuid not null references public.social_profiles(user_id) on delete cascade,
 receiver_id uuid not null references public.social_profiles(user_id) on delete cascade,
 status text not null default 'pending' check(status in ('pending','accepted','declined')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(sender_id,receiver_id),
 check(sender_id<>receiver_id)
);
create table if not exists public.social_blocks (
 blocker_id uuid not null references public.social_profiles(user_id) on delete cascade,
 blocked_id uuid not null references public.social_profiles(user_id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(blocker_id,blocked_id),
 check(blocker_id<>blocked_id)
);
create table if not exists public.social_posts (
 id uuid primary key default gen_random_uuid(),
 author_id uuid not null references public.social_profiles(user_id) on delete cascade,
 body text not null check(char_length(body) between 1 and 2000),
 audience text not null default 'friends' check(audience in ('friends','public')),
 created_at timestamptz not null default now()
);
create table if not exists public.social_comments (
 id uuid primary key default gen_random_uuid(),
 post_id uuid not null references public.social_posts(id) on delete cascade,
 author_id uuid not null references public.social_profiles(user_id) on delete cascade,
 body text not null check(char_length(body) between 1 and 1000),
 created_at timestamptz not null default now()
);
create table if not exists public.social_likes (
 post_id uuid not null references public.social_posts(id) on delete cascade,
 user_id uuid not null references public.social_profiles(user_id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(post_id,user_id)
);
create index if not exists social_friend_receiver_idx on public.social_friend_requests(receiver_id,status);
create index if not exists social_posts_created_idx on public.social_posts(created_at desc);
create index if not exists social_comments_post_idx on public.social_comments(post_id);
alter table public.social_profiles enable row level security;
alter table public.social_friend_requests enable row level security;
alter table public.social_blocks enable row level security;
alter table public.social_posts enable row level security;
alter table public.social_comments enable row level security;
alter table public.social_likes enable row level security;
-- Funzione SECURITY DEFINER con search_path fissato per evitare ricorsione RLS.
create or replace function public.social_are_friends(a uuid,b uuid)
returns boolean language sql stable security definer set search_path = '' as $$
 select exists (
  select 1 from public.social_friend_requests r
  where r.status='accepted'
  and ((r.sender_id=a and r.receiver_id=b) or (r.sender_id=b and r.receiver_id=a))
 ) and not exists (
  select 1 from public.social_blocks bl
  where (bl.blocker_id=a and bl.blocked_id=b) or (bl.blocker_id=b and bl.blocked_id=a)
 );
$$;
revoke all on function public.social_are_friends(uuid,uuid) from public;
grant execute on function public.social_are_friends(uuid,uuid) to authenticated;
create policy "Profiles visible to authenticated users" on public.social_profiles for select to authenticated using (
 user_id=auth.uid() or not exists (
 select 1 from public.social_blocks b where
 (b.blocker_id=user_id and b.blocked_id=auth.uid()) or
 (b.blocked_id=user_id and b.blocker_id=auth.uid())
 ));
create policy "Own profile insert" on public.social_profiles for insert to authenticated with check(user_id=auth.uid());
create policy "Own profile update" on public.social_profiles for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "Requests participants read" on public.social_friend_requests for select to authenticated using (
 (sender_id=auth.uid() or receiver_id=auth.uid()) and
 not exists(select 1 from public.social_blocks b where
 (b.blocker_id=sender_id and b.blocked_id=receiver_id) or
 (b.blocker_id=receiver_id and b.blocked_id=sender_id))
);
create policy "Send pending request" on public.social_friend_requests for insert to authenticated with check (
 sender_id=auth.uid() and status='pending' and not exists (
 select 1 from public.social_blocks b where
 (b.blocker_id=sender_id and b.blocked_id=receiver_id) or
 (b.blocker_id=receiver_id and b.blocked_id=sender_id))
);
-- Nessun UPDATE diretto alle richieste: accettazione via RPC verificata.
create or replace function public.social_respond_to_request(request_id uuid, response text)
returns void language plpgsql security definer set search_path = '' as $$
begin
 if response not in ('accepted','declined') then raise exception 'Invalid response'; end if;
 update public.social_friend_requests
 set status=response,updated_at=now()
 where id=request_id and receiver_id=auth.uid() and status='pending'
 and not exists(select 1 from public.social_blocks b where
 (b.blocker_id=sender_id and b.blocked_id=receiver_id) or
 (b.blocker_id=receiver_id and b.blocked_id=sender_id));
 if not found then raise exception 'Request unavailable'; end if;
end; $$;
revoke all on function public.social_respond_to_request(uuid,text) from public;
grant execute on function public.social_respond_to_request(uuid,text) to authenticated;
create policy "Own requests delete" on public.social_friend_requests for delete to authenticated using(sender_id=auth.uid() or receiver_id=auth.uid());
create policy "Own blocks read" on public.social_blocks for select to authenticated using(blocker_id=auth.uid());
create policy "Own blocks insert" on public.social_blocks for insert to authenticated with check(blocker_id=auth.uid());
create policy "Own blocks delete" on public.social_blocks for delete to authenticated using(blocker_id=auth.uid());
create policy "Posts audience read" on public.social_posts for select to authenticated using (
 author_id=auth.uid() or
 (not exists(select 1 from public.social_blocks b where
 (b.blocker_id=author_id and b.blocked_id=auth.uid()) or
 (b.blocker_id=auth.uid() and b.blocked_id=author_id))
 and (audience='public' or public.social_are_friends(author_id,auth.uid())))
);
create policy "Own posts insert" on public.social_posts for insert to authenticated with check(author_id=auth.uid());
create policy "Own posts update" on public.social_posts for update to authenticated using(author_id=auth.uid()) with check(author_id=auth.uid());
create policy "Own posts delete" on public.social_posts for delete to authenticated using(author_id=auth.uid());
create policy "Visible comments read" on public.social_comments for select to authenticated using (
 exists(select 1 from public.social_posts p where p.id=post_id)
);
create policy "Comment on visible post" on public.social_comments for insert to authenticated with check (
 author_id=auth.uid() and exists(select 1 from public.social_posts p where p.id=post_id)
);
create policy "Own comments delete" on public.social_comments for delete to authenticated using(author_id=auth.uid());
create policy "Visible likes read" on public.social_likes for select to authenticated using (
 exists(select 1 from public.social_posts p where p.id=post_id)
);
create policy "Like visible post" on public.social_likes for insert to authenticated with check (
 user_id=auth.uid() and exists(select 1 from public.social_posts p where p.id=post_id)
);
create policy "Unlike own" on public.social_likes for delete to authenticated using(user_id=auth.uid());
-- Le tabelle della collezione NON sono esposte qui. Condivisione e confronto
-- richiedono una vista/RPC dedicata che filtri per collection_visibility.
