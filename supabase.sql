-- Bảng xếp hạng chung cho Đờn Kết. Chạy trong Supabase > SQL Editor.
create table if not exists public.donket_scores (
  id         bigint generated always as identity primary key,
  name       text not null check (char_length(name) between 1 and 24),
  score      int  not null check (score between 0 and 1000),
  correct    int  not null check (correct between 0 and 10),
  created_at timestamptz not null default now()
);
create index if not exists donket_scores_rank_idx on public.donket_scores (score desc, created_at asc);

alter table public.donket_scores enable row level security;

-- Ai cũng xem được bảng xếp hạng
drop policy if exists "read scores" on public.donket_scores;
create policy "read scores" on public.donket_scores for select to anon, authenticated using (true);

-- Ai cũng gửi được điểm (không sửa / xoá được)
drop policy if exists "insert scores" on public.donket_scores;
create policy "insert scores" on public.donket_scores for insert to anon, authenticated
  with check (char_length(name) between 1 and 24 and score between 0 and 1000 and correct between 0 and 10);
