-- ============================================================
-- 大富翁 · 富贵人生 —— Supabase 初始化
-- 1) game-assets 公开素材桶(img/audio/sfx/models/视频)
-- 2) 排行榜(players)+ 联机房间(mp_rooms / mp_members)
-- 3) RLS + security definer RPC(游戏无登录体系,anon 可用,
--    写路径经 RPC 收窄,防刷/防越权)
-- ============================================================

-- ---------- 1. 存储桶 ----------
insert into storage.buckets (id, name, public)
values ('game-assets', 'game-assets', true)
on conflict (id) do update set public = true;

-- 公开读
drop policy if exists "game assets public read" on storage.objects;
create policy "game assets public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'game-assets');

-- ---------- 2. 排行榜 ----------
create table if not exists public.players (
  client_id   uuid primary key,           -- 设备指纹(localStorage 自生成)
  nickname    text not null default '玩家' check (char_length(nickname) between 1 and 10),
  char_id     text not null default 'boss',
  wins        int  not null default 0,
  rounds      int  not null default 0,    -- 参与局数
  rent_total  bigint not null default 0,  -- 累计收租
  jail_times  int  not null default 0,
  best_money  bigint not null default 0,  -- 单局最佳身价
  updated_at  timestamptz not null default now()
);

-- ---------- 3. 联机房间 ----------
create table if not exists public.mp_rooms (
  code          text primary key check (char_length(code) = 5),
  host_client   uuid not null,
  status        text not null default 'lobby' check (status in ('lobby','playing','closed')),
  theme         text not null default 'classic',
  max_rounds    int  not null default 0,
  start_money   int  not null default 30000,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.mp_members (
  room_code   text not null references public.mp_rooms(code) on delete cascade,
  client_id   uuid not null,
  seat        int  not null default -1,
  nickname    text not null default '玩家',
  char_id     text not null default 'boss',
  heartbeat   timestamptz not null default now(),
  primary key (room_code, client_id)
);

create index if not exists mp_members_room on public.mp_members (room_code);
create index if not exists mp_rooms_live on public.mp_rooms (status, updated_at desc);

-- ---------- 4. RLS ----------
alter table public.players    enable row level security;
alter table public.mp_rooms   enable row level security;
alter table public.mp_members enable row level security;

-- 全部只读开放,写入只走 RPC
drop policy if exists "players public read" on public.players;
create policy "players public read" on public.players for select to anon, authenticated using (true);

drop policy if exists "rooms public read" on public.mp_rooms;
create policy "rooms public read" on public.mp_rooms for select to anon, authenticated using (true);

drop policy if exists "members public read" on public.mp_members;
create policy "members public read" on public.mp_members for select to anon, authenticated using (true);

-- ---------- 5. RPC ----------
-- 上报一局结果(security definer;增量式,防刷)
create or replace function public.report_round(
  p_client_id uuid, p_nickname text, p_char_id text,
  p_won boolean, p_rent bigint, p_jail int, p_money bigint
) returns void
language plpgsql security definer set search_path = public as $$
begin
  insert into players (client_id, nickname, char_id, wins, rounds, rent_total, jail_times, best_money)
  values (p_client_id,
          coalesce(nullif(trim(p_nickname), ''), '玩家'),
          coalesce(p_char_id, 'boss'),
          case when p_won then 1 else 0 end, 1,
          greatest(coalesce(p_rent, 0), 0),
          greatest(coalesce(p_jail, 0), 0),
          greatest(coalesce(p_money, 0), 0))
  on conflict (client_id) do update set
    nickname   = excluded.nickname,
    char_id    = excluded.char_id,
    wins       = players.wins + case when p_won then 1 else 0 end,
    rounds     = players.rounds + 1,
    rent_total = players.rent_total + greatest(coalesce(p_rent, 0), 0),
    jail_times = players.jail_times + greatest(coalesce(p_jail, 0), 0),
    best_money = greatest(players.best_money, greatest(coalesce(p_money, 0), 0)),
    updated_at = now();
end $$;

-- 房间生命周期
create or replace function public.mp_room_create(
  p_host uuid, p_theme text, p_max_rounds int, p_start_money int
) returns text
language plpgsql security definer set search_path = public as $$
declare v_code text; v_try int := 0;
begin
  loop
    v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 5));
    v_code := translate(v_code, 'O0I1', 'ABCDEFG');  -- 避开易混字符
    begin
      insert into mp_rooms (code, host_client, theme, max_rounds, start_money)
      values (v_code, p_host, coalesce(p_theme, 'classic'), coalesce(p_max_rounds, 0), coalesce(p_start_money, 30000));
      return v_code;
    exception when unique_violation then
      v_try := v_try + 1;
      if v_try > 5 then raise 'code exhausted'; end if;
    end;
  end loop;
end $$;

create or replace function public.mp_room_join(p_code text, p_client uuid, p_nickname text, p_char_id text)
returns int  -- 分配的座位(0-3),-1 房间不存在/已满
language plpgsql security definer set search_path = public as $$
declare v_status text; v_taken int[];
begin
  select status into v_status from mp_rooms where code = upper(p_code);
  if v_status is null then return -1; end if;

  select coalesce(array_agg(seat) filter (where seat >= 0), '{}') into v_taken
  from mp_members where room_code = upper(p_code) and heartbeat > now() - interval '45 seconds';

  insert into mp_members (room_code, client_id, seat, nickname, char_id)
  values (upper(p_code), p_client,
          coalesce((select s from generate_series(0, 3) s where not (s = any(v_taken)) order by s limit 1), -1),
          coalesce(nullif(trim(p_nickname), ''), '玩家'), coalesce(p_char_id, 'boss'))
  on conflict (room_code, client_id) do update set
    nickname = excluded.nickname, char_id = excluded.char_id, heartbeat = now();

  return (select seat from mp_members where room_code = upper(p_code) and client_id = p_client);
end $$;

create or replace function public.mp_room_close(p_code text, p_host uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  update mp_rooms set status = 'closed', updated_at = now()
  where code = upper(p_code) and host_client = p_host;
end $$;

-- 心跳:房间与成员续命(仅本人可续)
create or replace function public.mp_heartbeat(p_code text, p_client uuid, p_playing boolean default null)
returns void
language plpgsql security definer set search_path = public as $$
begin
  update mp_members set heartbeat = now()
  where room_code = upper(p_code) and client_id = p_client;
  update mp_rooms set updated_at = now(),
         status = case when p_playing is null then status
                       when p_playing then 'playing' else 'lobby' end
  where code = upper(p_code)
    and (host_client = p_client or p_playing is null);
end $$;

-- 清理:关掉陈旧房间(心跳超时 3 分钟)
create or replace function public.mp_room_gc() returns void
language plpgsql security definer set search_path = public as $$
begin
  update mp_rooms set status = 'closed', updated_at = now()
  where status in ('lobby', 'playing') and updated_at < now() - interval '3 minutes';
end $$;

grant execute on function public.report_round(uuid, text, text, boolean, bigint, int, bigint) to anon, authenticated;
grant execute on function public.mp_room_create(uuid, text, int, int) to anon, authenticated;
grant execute on function public.mp_room_join(text, uuid, text, text) to anon, authenticated;
grant execute on function public.mp_room_close(text, uuid) to anon, authenticated;
grant execute on function public.mp_heartbeat(text, uuid, boolean) to anon, authenticated;
grant execute on function public.mp_room_gc() to anon, authenticated;
