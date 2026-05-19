-- Quiniela Mundial 2026 schema
-- Run this once in the Supabase SQL editor against a fresh project.

-- ── Tables ─────────────────────────────────────────────────────

create table if not exists public.players (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text not null unique check (char_length(trim(name)) between 1 and 20),
  created_at timestamptz not null default now()
);

create table if not exists public.results (
  match_id    text primary key,
  home_score  smallint not null check (home_score between 0 and 99),
  away_score  smallint not null check (away_score between 0 and 99),
  updated_at  timestamptz not null default now()
);

create table if not exists public.knockouts (
  id         text primary key,
  home       text not null,
  away       text not null,
  date       timestamptz not null,
  stage      text not null check (stage in ('R32','R16','QF','SF','3rd','Final')),
  created_at timestamptz not null default now()
);

create table if not exists public.predictions (
  player_id  uuid not null references public.players(id) on delete cascade,
  match_id   text not null,
  pick       text not null check (pick in ('home','away','draw')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (player_id, match_id)
);

create table if not exists public.config (
  key   text primary key,
  value jsonb not null
);

-- ── RLS ────────────────────────────────────────────────────────
-- Security model: this is a friends-only app. Any authenticated user
-- can read everything and write to results/knockouts/config (the admin
-- PIN is a UI gate, not a security boundary, matching the original
-- window.storage behavior). Predictions are owner-only writable.

alter table public.players     enable row level security;
alter table public.results     enable row level security;
alter table public.knockouts   enable row level security;
alter table public.predictions enable row level security;
alter table public.config      enable row level security;

-- Players
drop policy if exists "players_select" on public.players;
create policy "players_select" on public.players
  for select to authenticated using (true);

drop policy if exists "players_insert_self" on public.players;
create policy "players_insert_self" on public.players
  for insert to authenticated with check (auth.uid() = id);

drop policy if exists "players_update_self" on public.players;
create policy "players_update_self" on public.players
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Results (any authenticated user can read/write)
drop policy if exists "results_all" on public.results;
create policy "results_all" on public.results
  for all to authenticated using (true) with check (true);

-- Knockouts
drop policy if exists "knockouts_all" on public.knockouts;
create policy "knockouts_all" on public.knockouts
  for all to authenticated using (true) with check (true);

-- Predictions: read all, write own
drop policy if exists "predictions_select" on public.predictions;
create policy "predictions_select" on public.predictions
  for select to authenticated using (true);

drop policy if exists "predictions_modify_own" on public.predictions;
create policy "predictions_modify_own" on public.predictions
  for all to authenticated
  using (auth.uid() = player_id)
  with check (auth.uid() = player_id);

-- Config
drop policy if exists "config_all" on public.config;
create policy "config_all" on public.config
  for all to authenticated using (true) with check (true);

-- ── Touch updated_at on predictions ────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_predictions_touch on public.predictions;
create trigger trg_predictions_touch
  before update on public.predictions
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_results_touch on public.results;
create trigger trg_results_touch
  before update on public.results
  for each row execute function public.touch_updated_at();
