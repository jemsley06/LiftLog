-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.workouts enable row level security;
alter table public.sets enable row level security;
alter table public.friends enable row level security;
alter table public.parties enable row level security;
alter table public.party_members enable row level security;

-- Profiles: users can read all profiles, update only their own
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Exercises: everyone can read, users can create custom exercises
create policy "Exercises are viewable by everyone" on public.exercises for select using (true);
create policy "Users can create custom exercises" on public.exercises for insert with check (auth.uid() = created_by and is_custom = true);
create policy "Users can update own custom exercises" on public.exercises for update using (auth.uid() = created_by and is_custom = true);
create policy "Users can delete own custom exercises" on public.exercises for delete using (auth.uid() = created_by and is_custom = true);

-- Workouts: users can CRUD only their own
create policy "Users can view own workouts" on public.workouts for select using (auth.uid() = user_id);
create policy "Users can create own workouts" on public.workouts for insert with check (auth.uid() = user_id);
create policy "Users can update own workouts" on public.workouts for update using (auth.uid() = user_id);
create policy "Users can delete own workouts" on public.workouts for delete using (auth.uid() = user_id);

-- Sets: users can CRUD sets in their own workouts
create policy "Users can view own sets" on public.sets for select using (
  exists (select 1 from public.workouts where workouts.id = sets.workout_id and workouts.user_id = auth.uid())
);
create policy "Users can create sets in own workouts" on public.sets for insert with check (
  exists (select 1 from public.workouts where workouts.id = sets.workout_id and workouts.user_id = auth.uid())
);
create policy "Users can update sets in own workouts" on public.sets for update using (
  exists (select 1 from public.workouts where workouts.id = sets.workout_id and workouts.user_id = auth.uid())
);
create policy "Users can delete sets in own workouts" on public.sets for delete using (
  exists (select 1 from public.workouts where workouts.id = sets.workout_id and workouts.user_id = auth.uid())
);

-- Friends: users can see their own friend requests
create policy "Users can view own friend requests" on public.friends for select using (
  auth.uid() = requester_id or auth.uid() = addressee_id
);
create policy "Users can send friend requests" on public.friends for insert with check (auth.uid() = requester_id);
create policy "Users can update friend requests they received" on public.friends for update using (auth.uid() = addressee_id);
create policy "Users can delete own friend requests" on public.friends for delete using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- Parties: members can view, creator can update
create policy "Party members can view parties" on public.parties for select using (
  exists (select 1 from public.party_members where party_members.party_id = parties.id and party_members.user_id = auth.uid())
);
create policy "Users can create parties" on public.parties for insert with check (auth.uid() = created_by);
create policy "Party creator can update" on public.parties for update using (auth.uid() = created_by);

-- Party Members: members can view fellow members, users can join
create policy "Party members can view members" on public.party_members for select using (
  exists (select 1 from public.party_members pm where pm.party_id = party_members.party_id and pm.user_id = auth.uid())
);
create policy "Users can join parties" on public.party_members for insert with check (auth.uid() = user_id);
create policy "Score updates by system" on public.party_members for update using (
  exists (select 1 from public.party_members pm where pm.party_id = party_members.party_id and pm.user_id = auth.uid())
);

-- Enable realtime for party_members
alter publication supabase_realtime add table public.party_members;
