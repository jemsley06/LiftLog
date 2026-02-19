create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  muscle_group text not null,
  equipment text not null default 'barbell',
  is_custom boolean default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  deleted_at timestamptz
);

create index idx_exercises_muscle_group on public.exercises(muscle_group);
create index idx_exercises_created_by on public.exercises(created_by);
