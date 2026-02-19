create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text,
  started_at timestamptz default now() not null,
  completed_at timestamptz,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  deleted_at timestamptz
);

create index idx_workouts_user_id on public.workouts(user_id);
create index idx_workouts_started_at on public.workouts(started_at);
