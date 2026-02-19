-- Seed file: Default exercise library for LiftLog
-- All exercises are system-provided (is_custom = false, created_by = null)

-- Chest exercises
insert into public.exercises (name, muscle_group, equipment, is_custom, created_by) values
  ('Barbell Bench Press', 'chest', 'barbell', false, null),
  ('Incline Barbell Bench Press', 'chest', 'barbell', false, null),
  ('Decline Barbell Bench Press', 'chest', 'barbell', false, null),
  ('Incline Dumbbell Press', 'chest', 'dumbbell', false, null),
  ('Dumbbell Fly', 'chest', 'dumbbell', false, null),
  ('Cable Fly', 'chest', 'cable', false, null),
  ('Dips', 'chest', 'bodyweight', false, null),
  ('Push-ups', 'chest', 'bodyweight', false, null);

-- Back exercises
insert into public.exercises (name, muscle_group, equipment, is_custom, created_by) values
  ('Barbell Row', 'back', 'barbell', false, null),
  ('Pull-ups', 'back', 'bodyweight', false, null),
  ('Chin-ups', 'back', 'bodyweight', false, null),
  ('Lat Pulldown', 'back', 'cable', false, null),
  ('Seated Cable Row', 'back', 'cable', false, null),
  ('Deadlift', 'back', 'barbell', false, null),
  ('T-Bar Row', 'back', 'barbell', false, null),
  ('Dumbbell Row', 'back', 'dumbbell', false, null);

-- Shoulders exercises
insert into public.exercises (name, muscle_group, equipment, is_custom, created_by) values
  ('Overhead Press', 'shoulders', 'barbell', false, null),
  ('Dumbbell Shoulder Press', 'shoulders', 'dumbbell', false, null),
  ('Lateral Raise', 'shoulders', 'dumbbell', false, null),
  ('Face Pull', 'shoulders', 'cable', false, null),
  ('Rear Delt Fly', 'shoulders', 'dumbbell', false, null),
  ('Arnold Press', 'shoulders', 'dumbbell', false, null),
  ('Upright Row', 'shoulders', 'barbell', false, null);

-- Legs exercises
insert into public.exercises (name, muscle_group, equipment, is_custom, created_by) values
  ('Barbell Squat', 'legs', 'barbell', false, null),
  ('Front Squat', 'legs', 'barbell', false, null),
  ('Leg Press', 'legs', 'machine', false, null),
  ('Romanian Deadlift', 'legs', 'barbell', false, null),
  ('Leg Curl', 'legs', 'machine', false, null),
  ('Leg Extension', 'legs', 'machine', false, null),
  ('Calf Raise', 'legs', 'machine', false, null),
  ('Bulgarian Split Squat', 'legs', 'dumbbell', false, null),
  ('Hip Thrust', 'legs', 'barbell', false, null),
  ('Goblet Squat', 'legs', 'dumbbell', false, null);

-- Arms exercises
insert into public.exercises (name, muscle_group, equipment, is_custom, created_by) values
  ('Barbell Curl', 'arms', 'barbell', false, null),
  ('Tricep Pushdown', 'arms', 'cable', false, null),
  ('Hammer Curl', 'arms', 'dumbbell', false, null),
  ('Skull Crushers', 'arms', 'barbell', false, null),
  ('Preacher Curl', 'arms', 'barbell', false, null),
  ('Overhead Tricep Extension', 'arms', 'dumbbell', false, null),
  ('Concentration Curl', 'arms', 'dumbbell', false, null),
  ('Close-Grip Bench Press', 'arms', 'barbell', false, null);

-- Core exercises
insert into public.exercises (name, muscle_group, equipment, is_custom, created_by) values
  ('Plank', 'core', 'bodyweight', false, null),
  ('Cable Crunch', 'core', 'cable', false, null),
  ('Hanging Leg Raise', 'core', 'bodyweight', false, null),
  ('Ab Wheel Rollout', 'core', 'other', false, null),
  ('Russian Twist', 'core', 'bodyweight', false, null),
  ('Woodchoppers', 'core', 'cable', false, null);
