-- Đờn Kết — cấu trúc database (đã được tạo sẵn trên project "giasuchillchill").
-- Chỉ cần chạy lại file này nếu bạn chuyển sang một project Supabase khác.
create table if not exists public.donket_scores (
  id bigint generated always as identity primary key,
  name text not null check (char_length(btrim(name)) between 2 and 40),
  score int not null check (score between 0 and 1000),
  correct int not null check (correct between 0 and 10),
  duration_seconds int check (duration_seconds is null or duration_seconds between 0 and 7200),
  created_at timestamptz not null default now()
);
create index if not exists donket_scores_rank_idx on public.donket_scores (score desc, created_at asc);
alter table public.donket_scores enable row level security;
drop policy if exists "donket read scores" on public.donket_scores;
create policy "donket read scores" on public.donket_scores for select to anon, authenticated using (true);
drop policy if exists "donket insert scores" on public.donket_scores;
create policy "donket insert scores" on public.donket_scores for insert to anon, authenticated
  with check (char_length(btrim(name)) between 2 and 40 and score between 0 and 1000 and correct between 0 and 10);
grant select, insert on public.donket_scores to anon, authenticated;

-- Tên người chơi (không cho trùng)
create table if not exists public.donket_players (
  id bigint generated always as identity primary key,
  name text not null check (char_length(btrim(name)) between 2 and 40),
  name_key text not null check (char_length(name_key) between 2 and 40),
  created_at timestamptz not null default now()
);
create unique index if not exists donket_players_name_key_uq on public.donket_players (name_key);
alter table public.donket_players enable row level security;
drop policy if exists "donket register name" on public.donket_players;
create policy "donket register name" on public.donket_players for insert to anon, authenticated
  with check (char_length(btrim(name)) between 2 and 40 and char_length(name_key) between 2 and 40);
grant insert on public.donket_players to anon, authenticated;

-- Bảng xếp hạng: điểm cao nhất của mỗi người, xếp theo điểm rồi thời gian chơi
drop view if exists public.donket_leaderboard;
create view public.donket_leaderboard with (security_invoker = on) as
with best as (
  select distinct on (name) name, score, correct, duration_seconds, created_at
  from public.donket_scores
  order by name, score desc, duration_seconds asc nulls last, created_at asc
)
select name, score, correct, duration_seconds, created_at,
       rank() over (order by score desc, duration_seconds asc nulls last) as rank
from best;
grant select on public.donket_leaderboard to anon, authenticated;
