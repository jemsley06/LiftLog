create table public.sets (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  set_number integer not null,
  weight numeric not null check (weight >= 0),
  reps integer not null check (reps > 0),
  rpe numeric check (rpe >= 1 and rpe <= 10),
  calculated_1rm numeric,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  deleted_at timestamptz
);

create index idx_sets_workout_id on public.sets(workout_id);
create index idx_sets_exercise_id on public.sets(exercise_id);
