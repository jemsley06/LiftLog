# Architecture: LiftLog

A modern workout tracking app built with a monorepo structure containing a React Native mobile client and a lightweight server layer, backed by Supabase for authentication, database, and real-time features.

**Tech Stack:** React Native, Expo Router, NativeWind (TailwindCSS), Supabase (Auth, PostgreSQL, Realtime, Edge Functions)

---

## Top-Level Directory Structure

```
LiftLog/
├── app/                        # React Native mobile application (Expo)
├── server/                     # Server-side logic (Supabase Edge Functions, seeds, migrations)
├── spec.md                     # Product specification
├── architecture.md             # This file
├── todo.md                     # Task tracking
└── README.md                   # Project overview and setup instructions
```

---

## `app/` — Mobile Application

The Expo-managed React Native application. Uses file-based routing via Expo Router and NativeWind for styling.

```
app/
├── assets/                     # Static assets (images, fonts, icons, animations)
│   ├── fonts/
│   └── images/
├── src/
│   ├── app/                    # Expo Router file-based routes (screens & layouts)
│   │   ├── _layout.tsx         # Root layout (auth gate, providers, global wrappers)
│   │   ├── index.tsx           # Entry redirect (→ auth or home based on session)
│   │   ├── (auth)/             # Auth route group (unauthenticated users)
│   │   │   ├── _layout.tsx
│   │   │   ├── sign-in.tsx
│   │   │   └── sign-up.tsx
│   │   └── (tabs)/             # Main app tab navigator (authenticated users)
│   │       ├── _layout.tsx     # Tab bar configuration
│   │       ├── home.tsx        # Dashboard / today's workout
│   │       ├── history.tsx     # Workout history & progress
│   │       ├── social.tsx      # Friends, parties, leaderboards
│   │       └── profile.tsx     # User profile & settings
│   │
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Generic, app-agnostic primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── IconButton.tsx
│   │   ├── workout/            # Workout-specific components
│   │   │   ├── SetRow.tsx              # Single set entry (weight × reps) with inline editing
│   │   │   ├── ExerciseCard.tsx        # Exercise block containing its sets
│   │   │   ├── WorkoutCard.tsx         # Summary card for a completed workout
│   │   │   ├── ExercisePicker.tsx      # Search/select an exercise from the library
│   │   │   ├── RestTimer.tsx           # Configurable rest countdown between sets
│   │   │   └── OverloadPrompt.tsx      # Nudge to increase weight/reps when plateau detected
│   │   ├── progress/           # Charts and progress visualization
│   │   │   ├── ProgressChart.tsx       # Line chart for weight/reps/1RM over time
│   │   │   ├── ExerciseSummary.tsx     # Per-exercise stats (best set, recent trend, PR)
│   │   │   └── WorkoutSummary.tsx      # Post-workout recap with % changes per exercise
│   │   └── social/             # Social and group features
│   │       ├── FriendCard.tsx          # Friend list item showing name + top lifts
│   │       ├── PartyCard.tsx           # Party overview (members, scoring, status)
│   │       ├── Leaderboard.tsx         # Ranked list of participants in a party
│   │       └── InviteModal.tsx         # Send/accept party invitations
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts                  # Auth state, sign-in, sign-up, sign-out wrappers
│   │   ├── useWorkout.ts              # Active workout session state management
│   │   ├── useExerciseHistory.ts      # Fetch and cache past sets for a given exercise
│   │   ├── useProgressData.ts         # Query transformed data for charts
│   │   ├── useFriends.ts             # Friend list CRUD and real-time presence
│   │   └── useParty.ts               # Party creation, joining, scoring subscription
│   │
│   ├── services/               # API and external service integrations
│   │   ├── supabase.ts                # Supabase client initialization & config
│   │   ├── auth.ts                    # Authentication API calls
│   │   ├── workouts.ts               # CRUD operations for workouts, exercises, sets
│   │   ├── exercises.ts              # Exercise library queries
│   │   ├── progress.ts               # Progress and analytics queries
│   │   ├── social.ts                 # Friends, invites, party management
│   │   └── realtime.ts               # Supabase Realtime channel subscriptions
│   │
│   ├── utils/                  # Pure utility functions (no side effects)
│   │   ├── calculations.ts           # 1RM (Brzycki), strength %, plateau detection
│   │   ├── formatting.ts             # Date, weight, and number display formatting
│   │   └── validation.ts             # Input validation helpers (weight > 0, reps > 0, etc.)
│   │
│   ├── constants/              # App-wide constants and configuration
│   │   ├── exercises.ts               # Default exercise library (name, muscle group, type)
│   │   └── scoring.ts                # Party intensity-based scoring formula
│   │
│   ├── types/                  # Shared TypeScript type definitions
│   │   ├── workout.ts                # Workout, Exercise, Set, ExerciseLog types
│   │   ├── user.ts                   # User, Profile, FriendRequest types
│   │   ├── party.ts                  # Party, PartyMember, Score types
│   │   └── navigation.ts            # Route params and navigation prop types
│   │
│   └── providers/              # React context providers
│       ├── AuthProvider.tsx           # Session management, auth state context
│       └── WorkoutProvider.tsx        # Active workout session context
│
├── app.json                    # Expo configuration
├── tailwind.config.js          # NativeWind / TailwindCSS theme customization
├── tsconfig.json
└── package.json
```

### Key Architectural Decisions — App

- **File-based routing via Expo Router:** Route groups `(auth)` and `(tabs)` cleanly separate unauthenticated and authenticated flows. The root `_layout.tsx` acts as the auth gate.
- **Component hierarchy:** `ui/` holds completely generic, reusable primitives with no business logic. Domain folders (`workout/`, `progress/`, `social/`) compose these primitives with domain-specific behavior.
- **Hooks as the data layer interface:** Screens never call `services/` directly. Hooks encapsulate data fetching, caching, mutations, and optimistic updates, keeping screens focused on layout and interaction.
- **`utils/calculations.ts` is the single source of truth** for all 1RM and strength percentage math. Every component that needs a calculated value imports from here — no inline formulas scattered across the app.
- **NativeWind for styling:** All styling uses Tailwind utility classes via NativeWind. Custom theme tokens (colors, spacing, typography) are defined in `tailwind.config.js` to enforce visual consistency.

---

## `server/` — Backend (Supabase)

The server directory contains database migrations, seed data, Supabase Edge Functions for logic that must run server-side, and Row Level Security (RLS) policies.

```
server/
├── supabase/
│   ├── migrations/             # Sequential SQL migration files
│   │   ├── 00001_create_profiles.sql
│   │   ├── 00002_create_exercises.sql
│   │   ├── 00003_create_workouts.sql
│   │   ├── 00004_create_sets.sql
│   │   ├── 00005_create_friends.sql
│   │   ├── 00006_create_parties.sql
│   │   └── 00007_create_rls_policies.sql
│   │
│   ├── seed.sql                # Default exercise library + test data
│   │
│   └── functions/              # Supabase Edge Functions (Deno/TypeScript)
│       ├── calculate-party-scores/     # Compute and rank scores for active parties
│       │   └── index.ts
│       ├── detect-plateaus/            # Analyze recent sets and flag stalled exercises
│       │   └── index.ts
│       └── generate-workout-summary/   # Compile post-workout stats and % changes
│           └── index.ts
│
├── config.toml                 # Supabase local dev configuration
└── README.md                   # Database setup and migration instructions
```

### Key Architectural Decisions — Server

- **Supabase as the primary backend:** Auth, database, real-time subscriptions, and storage are all handled by Supabase. This eliminates the need for a custom REST API for standard CRUD.
- **Edge Functions for computed logic only:** The client handles simple reads and writes directly via the Supabase JS client. Edge Functions are reserved for operations that require server-side authority (scoring, anti-cheat, cross-user aggregation).
- **Migrations are the schema source of truth:** Every schema change goes through a numbered migration file. No manual database edits.
- **RLS policies enforce access control at the database level:** Users can only read/write their own data. Friend and party access is governed by relationship records. This means even if client code has a bug, data remains protected.

---

## Database Schema

All tables live in the Supabase PostgreSQL database. Below is the logical data model.

### `profiles`
Extends Supabase Auth's `auth.users` with app-specific data.

| Column         | Type      | Notes                                      |
|----------------|-----------|--------------------------------------------|
| id             | uuid (PK) | References `auth.users.id`                 |
| username       | text      | Unique, user-chosen display name           |
| avatar_url     | text      | Optional profile image URL                 |
| created_at     | timestamp | Auto-set on creation                       |

### `exercises`
Canonical exercise library shared across all users.

| Column         | Type      | Notes                                      |
|----------------|-----------|--------------------------------------------|
| id             | uuid (PK) | Auto-generated                             |
| name           | text      | e.g., "Barbell Bench Press"                |
| muscle_group   | text      | Primary muscle group targeted              |
| equipment      | text      | e.g., "barbell", "dumbbell", "bodyweight"  |
| is_custom      | boolean   | `true` if created by a user                |
| created_by     | uuid (FK) | Nullable — references `profiles.id`        |

### `workouts`
A single training session.

| Column         | Type      | Notes                                      |
|----------------|-----------|--------------------------------------------|
| id             | uuid (PK) | Auto-generated                             |
| user_id        | uuid (FK) | References `profiles.id`                   |
| name           | text      | Optional label (e.g., "Push Day")          |
| started_at     | timestamp | When the workout began                     |
| completed_at   | timestamp | Nullable — null while in progress          |
| notes          | text      | Optional free-form notes                   |

### `sets`
Individual sets within a workout, linked to an exercise.

| Column         | Type      | Notes                                      |
|----------------|-----------|--------------------------------------------|
| id             | uuid (PK) | Auto-generated                             |
| workout_id     | uuid (FK) | References `workouts.id`                   |
| exercise_id    | uuid (FK) | References `exercises.id`                  |
| set_number     | integer   | Order within the exercise for this workout |
| weight         | numeric   | Weight used (user's preferred unit)        |
| reps           | integer   | Number of repetitions completed            |
| rpe            | numeric   | Optional — Rate of Perceived Exertion      |
| calculated_1rm | numeric   | Computed via Brzycki formula on insert     |
| created_at     | timestamp | Auto-set on creation                       |

### `friends`
Bidirectional friendship records.

| Column         | Type      | Notes                                      |
|----------------|-----------|--------------------------------------------|
| id             | uuid (PK) | Auto-generated                             |
| requester_id   | uuid (FK) | User who sent the request                  |
| addressee_id   | uuid (FK) | User who received the request              |
| status         | text      | `pending`, `accepted`, `declined`          |
| created_at     | timestamp | Auto-set on creation                       |

### `parties`
Group lift competitions.

| Column         | Type      | Notes                                      |
|----------------|-----------|--------------------------------------------|
| id             | uuid (PK) | Auto-generated                             |
| name           | text      | Party display name                         |
| created_by     | uuid (FK) | References `profiles.id`                   |
| started_at     | timestamp | When the group lift began                  |
| ended_at       | timestamp | Nullable — null while in progress          |
| is_active      | boolean   | `true` until any user ends the session     |

### `party_members`
Join table linking users to parties.

| Column         | Type      | Notes                                      |
|----------------|-----------|--------------------------------------------|
| id             | uuid (PK) | Auto-generated                             |
| party_id       | uuid (FK) | References `parties.id`                    |
| user_id        | uuid (FK) | References `profiles.id`                   |
| score          | numeric   | Running total — updated by Edge Function   |
| joined_at      | timestamp | Auto-set on join                           |

---

## API Layer

### Client-Side (Supabase JS Client)
Standard CRUD operations go directly through the Supabase client library. No intermediary API server is needed for these.

| Operation                     | Method                                         |
|-------------------------------|-------------------------------------------------|
| Sign up / Sign in / Sign out  | `supabase.auth.signUp()`, `.signInWithPassword()`, `.signOut()` |
| Fetch exercise library        | `supabase.from('exercises').select()`           |
| Create a workout              | `supabase.from('workouts').insert()`            |
| Log a set                     | `supabase.from('sets').insert()`                |
| Get workout history           | `supabase.from('workouts').select('*, sets(*)').eq('user_id', uid)` |
| Get sets for an exercise      | `supabase.from('sets').select().eq('exercise_id', eid)` |
| Send friend request           | `supabase.from('friends').insert()`             |
| Accept friend request         | `supabase.from('friends').update({ status: 'accepted' })` |
| Join a party                  | `supabase.from('party_members').insert()`       |
| Subscribe to party scores     | `supabase.channel('party').on('postgres_changes', ...)` |

### Server-Side (Edge Functions)
Called via `supabase.functions.invoke()` from the client.

| Function                       | Trigger / Purpose                                              |
|--------------------------------|----------------------------------------------------------------|
| `calculate-party-scores`       | Invoked when a set is logged during an active party. Scores the set based on its intensity (`set_1RM / user's best_1RM` for that exercise) and adds the result to `party_members.score`. |
| `detect-plateaus`              | Invoked after a workout is completed. Compares recent sets against historical bests to identify stalled exercises. Returns a list of exercises with suggested increases. |
| `generate-workout-summary`     | Invoked when a workout is marked complete. Returns per-exercise stats: best set, 1RM change %, volume change %. |

---

## Inter-Module Communication

```
┌─────────────────────────────────────────────────────────┐
│                      Mobile App                          │
│                                                          │
│  Screens (Expo Router)                                   │
│      ↕ props / context                                   │
│  Providers (Auth, Workout)                               │
│      ↕ hooks                                             │
│  Hooks (useAuth, useWorkout, useProgressData, ...)       │
│      ↕ function calls                                    │
│  Services (auth.ts, workouts.ts, social.ts, ...)         │
│      ↕ Supabase JS Client                                │
├──────────────────────────┬──────────────────────────────┤
│        Direct DB Access  │   Edge Function Invocations   │
│        (CRUD via RLS)    │   (Computed server logic)     │
└──────────┬───────────────┴──────────────┬───────────────┘
           │                              │
           ▼                              ▼
┌─────────────────────────────────────────────────────────┐
│                    Supabase Backend                       │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────────┐ │
│  │   Auth   │  │ Realtime │  │    Edge Functions       │ │
│  └──────────┘  └──────────┘  └────────────────────────┘ │
│                       ↕                                  │
│              ┌─────────────────┐                         │
│              │   PostgreSQL    │                         │
│              │   (with RLS)   │                         │
│              └─────────────────┘                         │
└─────────────────────────────────────────────────────────┘
```

### Data Flow Example — Logging a Set

1. User enters weight and reps in `SetRow` component.
2. `useWorkout` hook calls `workouts.logSet()` in `services/`.
3. `services/workouts.ts` calls `supabase.from('sets').insert(...)` with the `calculated_1rm` computed by `utils/calculations.ts`.
4. Supabase inserts the row (RLS verifies the user owns the workout).
5. If the user is in an active party, the service also invokes `calculate-party-scores` Edge Function.
6. The Edge Function computes the set's intensity score (`set_1RM / user's best_1RM` for that exercise), adds it to `party_members.score`, which triggers a Realtime event.
7. All party members subscribed to the party channel receive the updated leaderboard.

---

## Calculations Reference

All formulas live in `app/src/utils/calculations.ts`.

- **Brzycki 1RM:** `1RM = weight × (36 / (37 - reps))` — used when `reps <= 36`.
- **Strength % (Set Difficulty):** `strength% = (set_1RM / best_1RM) × 100` — compares a single set's estimated 1RM against the user's all-time best for that exercise.
- **Plateau Detection:** An exercise is flagged as plateaued if the most recent *N* sessions show no increase in best-set 1RM compared to the session before them. The threshold *N* is configurable.
- **Party Scoring (Intensity-Based):** Each set is scored as `(set_1RM / best_1RM) × 100` — the intensity of the set relative to the user's all-time best 1RM for that exercise. A user's total party score is the sum of all their set scores during the session. The user with the highest total score when the party ends wins. Formula defined in `constants/scoring.ts`.
