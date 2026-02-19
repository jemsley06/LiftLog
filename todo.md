# LiftLog — Build Todo

## Phase 1: Project Scaffolding & Configuration
- [x] Initialize Expo project in `app/` with TypeScript template
- [x] Install all dependencies (NativeWind, WatermelonDB, Supabase, Expo Router, charts, etc.)
- [x] Configure TypeScript (`tsconfig.json`)
- [x] Configure NativeWind / TailwindCSS (`tailwind.config.js`, `global.css`)
- [x] Configure Expo (`app.json`) with required plugins
- [x] Configure Babel for NativeWind + WatermelonDB decorators
- [x] Configure Metro bundler for WatermelonDB

## Phase 2: Server — Supabase Migrations, Seeds & Edge Functions
- [x] Create Supabase config (`server/config.toml`)
- [x] Write migration: `00001_create_profiles.sql`
- [x] Write migration: `00002_create_exercises.sql`
- [x] Write migration: `00003_create_workouts.sql`
- [x] Write migration: `00004_create_sets.sql`
- [x] Write migration: `00005_create_friends.sql`
- [x] Write migration: `00006_create_parties.sql`
- [x] Write migration: `00007_create_rls_policies.sql`
- [x] Write seed data: `seed.sql` (default exercise library)
- [x] Write Edge Function: `calculate-party-scores`
- [x] Write Edge Function: `detect-plateaus`
- [x] Write Edge Function: `generate-workout-summary`

## Phase 3: Types & Constants
- [x] Define types: `workout.ts`, `user.ts`, `party.ts`, `navigation.ts`
- [x] Define constants: `exercises.ts` (default exercise library)
- [x] Define constants: `scoring.ts` (party scoring formula)

## Phase 4: Utilities
- [x] Implement `calculations.ts` (Brzycki 1RM, strength %, plateau detection)
- [x] Implement `formatting.ts` (date, weight, number formatting)
- [x] Implement `validation.ts` (input validation helpers)

## Phase 5: Database Layer (WatermelonDB)
- [x] Define WatermelonDB schema (`db/schema.ts`)
- [x] Define WatermelonDB migrations (`db/migrations.ts`)
- [x] Create WatermelonDB models: Profile, Exercise, Workout, Set, Friend, Party, PartyMember
- [x] Initialize database (`db/index.ts`)
- [x] Implement sync logic (`db/sync.ts`)

## Phase 6: Services Layer
- [x] Initialize Supabase client (`services/supabase.ts`)
- [x] Implement auth service (`services/auth.ts`)
- [x] Implement workouts service (`services/workouts.ts`)
- [x] Implement exercises service (`services/exercises.ts`)
- [x] Implement progress service (`services/progress.ts`)
- [x] Implement social service (`services/social.ts`)
- [x] Implement realtime service (`services/realtime.ts`)

## Phase 7: Providers & Hooks
- [x] Implement `AuthProvider.tsx`
- [x] Implement `DatabaseProvider.tsx`
- [x] Implement `WorkoutProvider.tsx`
- [x] Implement `useAuth.ts` hook
- [x] Implement `useWorkout.ts` hook
- [x] Implement `useExerciseHistory.ts` hook
- [x] Implement `useProgressData.ts` hook
- [x] Implement `useFriends.ts` hook
- [x] Implement `useParty.ts` hook
- [x] Implement `useNetworkStatus.ts` hook

## Phase 8: UI Components
- [x] Build generic UI primitives: Button, Card, Input, Modal, Badge, IconButton
- [x] Build workout components: SetRow, ExerciseCard, WorkoutCard, ExercisePicker, RestTimer, OverloadPrompt
- [x] Build progress components: ProgressChart, ExerciseSummary, WorkoutSummary
- [x] Build social components: FriendCard, PartyCard, Leaderboard, InviteModal

## Phase 9: Screens & Navigation
- [x] Root layout (`_layout.tsx`) — auth gate, providers, global wrappers
- [x] Entry redirect (`index.tsx`)
- [x] Auth screens: sign-in, sign-up (with layout)
- [x] Tab navigator layout (`(tabs)/_layout.tsx`)
- [x] Home screen — dashboard / today's workout
- [x] History screen — workout history & progress
- [x] Social screen — friends, parties, leaderboards
- [x] Profile screen — user profile & settings

## Phase 10: Polish & Documentation
- [x] TypeScript compiles with zero errors
- [x] Write `SETUP.md` with complete setup instructions
