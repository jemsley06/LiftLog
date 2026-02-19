# Architecture: LiftLog

A modern, offline-first workout tracking app built with a monorepo structure containing a React Native mobile client and a lightweight server layer. All user data is stored locally via WatermelonDB for instant reads/writes and full offline support, then synced to Supabase when connectivity is available.

**Tech Stack:** React Native, Expo Router, NativeWind (TailwindCSS), WatermelonDB (local SQLite), Supabase (Auth, PostgreSQL, Realtime, Edge Functions)

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
│   │   ├── useParty.ts               # Party creation, joining, scoring subscription
│   │   └── useNetworkStatus.ts       # Online/offline detection, triggers sync when reconnected
│   │
│   ├── db/                     # WatermelonDB local database (offline-first)
│   │   ├── schema.ts                  # WatermelonDB table schemas (mirrors Supabase structure)
│   │   ├── migrations.ts             # WatermelonDB local schema migrations
│   │   ├── index.ts                  # Database initialization and provider setup
│   │   ├── models/                   # WatermelonDB Model classes
│   │   │   ├── Profile.ts
│   │   │   ├── Exercise.ts
│   │   │   ├── Workout.ts
│   │   │   ├── Set.ts
│   │   │   ├── Friend.ts
│   │   │   ├── Party.ts
│   │   │   └── PartyMember.ts
│   │   └── sync.ts                   # Supabase ↔ WatermelonDB sync logic (pull/push)
│   │
│   ├── services/               # API and external service integrations
│   │   ├── supabase.ts                # Supabase client initialization & config
│   │   ├── auth.ts                    # Authentication API calls
│   │   ├── workouts.ts               # CRUD operations for workouts, exercises, sets (via WatermelonDB)
│   │   ├── exercises.ts              # Exercise library queries (via WatermelonDB)
│   │   ├── progress.ts               # Progress and analytics queries (via WatermelonDB)
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
│       ├── DatabaseProvider.tsx       # WatermelonDB instance provider, passes DB to component tree
│       └── WorkoutProvider.tsx        # Active workout session context
│
├── app.json                    # Expo configuration
├── tailwind.config.js          # NativeWind / TailwindCSS theme customization
├── tsconfig.json
└── package.json
```

### Key Architectural Decisions — App

- **Offline-first via WatermelonDB:** All reads and writes for user-owned data (workouts, sets, exercises, progress) go through the local WatermelonDB (SQLite) database. The app is fully functional without an internet connection. Changes sync to Supabase in the background when connectivity is available. This ensures zero-latency UI updates and uninterrupted workout logging regardless of network conditions.
- **File-based routing via Expo Router:** Route groups `(auth)` and `(tabs)` cleanly separate unauthenticated and authenticated flows. The root `_layout.tsx` acts as the auth gate.
- **Component hierarchy:** `ui/` holds completely generic, reusable primitives with no business logic. Domain folders (`workout/`, `progress/`, `social/`) compose these primitives with domain-specific behavior.
- **Hooks as the data layer interface:** Screens never call `services/` or `db/` directly. Hooks encapsulate data fetching, caching, mutations, and optimistic updates, keeping screens focused on layout and interaction.
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

- **Supabase as the cloud backend:** Auth, remote database, real-time subscriptions, and storage are all handled by Supabase. Standard CRUD for user-owned data flows through WatermelonDB locally and syncs to Supabase — the client does not make direct Supabase CRUD calls for synced tables.
- **Edge Functions for computed logic only:** Edge Functions are reserved for operations that require server-side authority (scoring, anti-cheat, cross-user aggregation). They run after sync pushes data to the server.
- **Migrations are the schema source of truth:** Every schema change goes through a numbered migration file. No manual database edits.
- **RLS policies enforce access control at the database level:** Users can only read/write their own data. Friend and party access is governed by relationship records. This means even if client code has a bug, data remains protected.

---

## Database Schema

All tables live in both the local WatermelonDB (SQLite) and the remote Supabase PostgreSQL database. The schemas mirror each other. Synced tables include `updated_at` and `deleted_at` columns for sync tracking (see Offline & Sync Strategy). Below is the logical data model.

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

### Local-First Operations (WatermelonDB)
These operations read from and write to the local WatermelonDB database. They work **offline** and sync to Supabase automatically when the device is online.

| Operation                     | Method                                                          |
|-------------------------------|-----------------------------------------------------------------|
| Create a workout              | `database.write(() => database.get('workouts').create(...))`    |
| Log a set                     | `database.write(() => database.get('sets').create(...))`        |
| Get workout history           | `database.get('workouts').query(Q.where('user_id', uid))`      |
| Get sets for an exercise      | `database.get('sets').query(Q.where('exercise_id', eid))`      |
| Browse exercise library       | `database.get('exercises').query()`                             |
| Create custom exercise        | `database.write(() => database.get('exercises').create(...))`   |

### Online-Only Operations (Supabase Direct)
These operations require a network connection and go directly through the Supabase client. They are **not** available offline.

| Operation                     | Method                                                          |
|-------------------------------|-----------------------------------------------------------------|
| Sign up / Sign in / Sign out  | `supabase.auth.signUp()`, `.signInWithPassword()`, `.signOut()` |
| Send friend request           | `supabase.from('friends').insert()`                             |
| Accept friend request         | `supabase.from('friends').update({ status: 'accepted' })`      |
| Join a party                  | `supabase.from('party_members').insert()`                       |
| Subscribe to party scores     | `supabase.channel('party').on('postgres_changes', ...)`         |

### Server-Side (Edge Functions)
Called via `supabase.functions.invoke()` from the client when online. Queued and retried after sync if invoked while offline.

| Function                       | Trigger / Purpose                                              |
|--------------------------------|----------------------------------------------------------------|
| `calculate-party-scores`       | Invoked when a set is logged during an active party. Scores the set based on its intensity (`set_1RM / user's best_1RM` for that exercise) and adds the result to `party_members.score`. |
| `detect-plateaus`              | Invoked after a workout is completed. Compares recent sets against historical bests to identify stalled exercises. Returns a list of exercises with suggested increases. |
| `generate-workout-summary`     | Invoked when a workout is marked complete. Returns per-exercise stats: best set, 1RM change %, volume change %. |

---

## Inter-Module Communication

```
┌──────────────────────────────────────────────────────────────┐
│                         Mobile App                            │
│                                                               │
│  Screens (Expo Router)                                        │
│      ↕ props / context                                        │
│  Providers (Auth, Database, Workout)                          │
│      ↕ hooks                                                  │
│  Hooks (useAuth, useWorkout, useProgressData, ...)            │
│      ↕ function calls                                         │
│  Services (workouts.ts, exercises.ts, social.ts, ...)         │
│      ↕                                ↕                       │
│  ┌──────────────────┐    ┌──────────────────────────────┐    │
│  │   WatermelonDB   │    │   Supabase JS Client          │    │
│  │   (local SQLite) │    │   (auth, social, realtime)    │    │
│  └────────┬─────────┘    └──────────────┬───────────────┘    │
│           │                              │                    │
│           │    ┌──────────────────┐      │                    │
│           └───→│   db/sync.ts     │←─────┘                    │
│                │   (pull & push)  │                            │
│                └────────┬─────────┘                            │
├─────────────────────────┼────────────────────────────────────┤
│           Offline OK    │              Online Only             │
│  (workouts, sets,       │    (auth, friends, parties,         │
│   exercises, progress)  │     realtime, edge functions)       │
└─────────────────────────┼────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                      Supabase Backend                         │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────────┐   │
│  │   Auth   │  │ Realtime │  │     Edge Functions        │   │
│  └──────────┘  └──────────┘  └──────────────────────────┘   │
│                        ↕                                      │
│               ┌─────────────────┐                             │
│               │   PostgreSQL    │                             │
│               │   (with RLS)   │                             │
│               └─────────────────┘                             │
└──────────────────────────────────────────────────────────────┘
```

### Data Flow Example — Logging a Set

1. User enters weight and reps in `SetRow` component.
2. `useWorkout` hook calls `workouts.logSet()` in `services/`.
3. `services/workouts.ts` writes the set to **WatermelonDB** with the `calculated_1rm` computed by `utils/calculations.ts`. The UI updates instantly from the local database.
4. If the device is **online**, `db/sync.ts` pushes the new set to Supabase PostgreSQL (RLS verifies the user owns the workout).
5. If the device is **offline**, the set is persisted locally and will sync automatically when connectivity resumes.
6. If the user is in an active party and online, the service invokes `calculate-party-scores` Edge Function after sync.
7. The Edge Function computes the set's intensity score (`set_1RM / user's best_1RM` for that exercise), adds it to `party_members.score`, which triggers a Realtime event.
8. All party members subscribed to the party channel receive the updated leaderboard.

---

## Offline & Sync Strategy

The app follows an **offline-first** pattern: WatermelonDB (backed by SQLite) is the primary data store on the device. Supabase PostgreSQL is the cloud source of truth for cross-device sync and social features.

### How Sync Works

Sync is implemented in `db/sync.ts` using WatermelonDB's built-in `synchronize()` function, which coordinates a **pull** (server → local) and **push** (local → server) in each sync cycle.

1. **Pull:** Fetches all records from Supabase that have been created, updated, or deleted since the last sync timestamp. Applies them to the local WatermelonDB.
2. **Push:** Sends all locally created, updated, or deleted records (tracked by WatermelonDB's change tracking) to Supabase.
3. **Conflict resolution:** Server wins — if a record was modified both locally and remotely, the server version takes precedence on pull.

### When Sync Triggers

| Trigger                          | Behavior                                                     |
|----------------------------------|--------------------------------------------------------------|
| App launch (if online)           | Runs a full pull → push cycle to catch up on changes         |
| Network reconnect                | `useNetworkStatus` detects connectivity restored, triggers sync |
| After local write (if online)    | Debounced push to keep Supabase in near-real-time sync       |
| Manual pull-to-refresh           | User-initiated sync on relevant screens                      |

### What Syncs vs. What Doesn't

| Data                     | Syncs Offline → Online | Notes                                               |
|--------------------------|------------------------|-----------------------------------------------------|
| Workouts, Sets           | Yes                    | Core logging — fully offline, syncs when available   |
| Exercises (custom)       | Yes                    | User-created exercises sync to their account         |
| Exercises (global)       | Pull only              | Seeded from server, read-only locally                |
| Profiles                 | Pull only              | Profile edits require online (via Supabase Auth)     |
| Friends                  | No (online-only)       | Social features require real-time server interaction |
| Parties / Party Members  | No (online-only)       | Group lifts are inherently real-time and multiplayer |

### Sync Column Convention

Every synced table in Supabase includes these columns to support WatermelonDB's sync protocol:

| Column      | Type      | Purpose                                              |
|-------------|-----------|------------------------------------------------------|
| created_at  | timestamp | Record creation time                                 |
| updated_at  | timestamp | Last modification time — used as the sync cursor     |
| deleted_at  | timestamp | Nullable — soft-delete marker for sync tombstoning   |

Records are **soft-deleted** (setting `deleted_at`) rather than hard-deleted, so the sync pull can detect deletions. A periodic server-side cleanup job can hard-delete old tombstoned records after a safe retention window.

---

## Calculations Reference

All formulas live in `app/src/utils/calculations.ts`.

- **Brzycki 1RM:** `1RM = weight × (36 / (37 - reps))` — used when `reps <= 36`.
- **Strength % (Set Difficulty):** `strength% = (set_1RM / best_1RM) × 100` — compares a single set's estimated 1RM against the user's current best for that exercise. When a new best set is recorded, previous sets are **not** retroactively rescored; the new best applies only to sets logged going forward.
- **Plateau Detection:** An exercise is flagged as plateaued if the most recent *N* sessions show no increase in best-set 1RM compared to the session before them. The threshold *N* is configurable.
- **Party Scoring (Intensity-Based):** Each set is scored as `(set_1RM / best_1RM) × 100` — the intensity of the set relative to the user's all-time best 1RM for that exercise. A user's total party score is the sum of all their set scores during the session. The user with the highest total score when the party ends wins. Formula defined in `constants/scoring.ts`.

---

## Future Features

Planned additions that are **not** part of the initial build. The architecture below describes how they will integrate with the existing structure when implemented.

### Form Review via Video Upload

Users will be able to upload videos of their lifts and receive AI-powered feedback on their form (e.g., squat depth, back rounding on deadlifts, bar path on bench press).

#### App — New Files

```
src/
├── app/(tabs)/
│   └── ... (form review accessible from exercise history or a dedicated tab)
│
├── components/form-review/
│   ├── VideoUploader.tsx             # Camera/gallery picker, video trimming, upload progress
│   ├── FormFeedbackCard.tsx          # Displays AI analysis results (score, annotations, tips)
│   └── VideoPlayer.tsx               # Playback with overlaid keypoint/skeleton annotations
│
├── hooks/
│   └── useFormReview.ts              # Upload lifecycle, polling/subscription for analysis status
│
├── services/
│   └── form-review.ts               # Upload video to Supabase Storage, invoke analysis Edge Function
│
└── types/
    └── form-review.ts               # VideoUpload, FormAnalysis, Keypoint, Feedback types
```

#### Server — New Infrastructure

```
server/supabase/
├── migrations/
│   └── 0000X_create_form_reviews.sql
│
├── functions/
│   └── analyze-form/                 # Edge Function: receives video reference, sends to ML service, stores results
│       └── index.ts
│
└── storage/                          # Supabase Storage bucket configuration
    └── videos/                       # Bucket for user-uploaded lift videos (RLS-protected, per-user paths)
```

#### Database — `form_reviews` Table

| Column           | Type      | Notes                                                    |
|------------------|-----------|----------------------------------------------------------|
| id               | uuid (PK) | Auto-generated                                           |
| user_id          | uuid (FK) | References `profiles.id`                                 |
| exercise_id      | uuid (FK) | References `exercises.id`                                |
| video_url        | text      | Path in Supabase Storage bucket                          |
| status           | text      | `uploading`, `processing`, `completed`, `failed`         |
| feedback         | jsonb     | Structured ML output (form score, per-frame annotations, suggestions) |
| created_at       | timestamp | Auto-set on creation                                     |

#### Data Flow — Video Form Review

1. User selects a video from camera roll or records one via `VideoUploader`.
2. `useFormReview` hook calls `form-review.ts` service to upload the video to Supabase Storage (`videos/{user_id}/{uuid}.mp4`).
3. After upload completes, the service invokes the `analyze-form` Edge Function with the video storage path and exercise type.
4. The Edge Function creates a `form_reviews` row with status `processing`, then sends the video to an external ML service for pose estimation and form analysis.
5. When the ML service returns results, the Edge Function writes structured feedback (form score, keypoint data, text suggestions) to the `feedback` jsonb column and sets status to `completed`.
6. The client receives the update via Realtime subscription or polling and renders the annotated feedback in `FormFeedbackCard`.

#### ML Integration Notes

- The external ML service is **not** built into the Supabase stack. The Edge Function acts as a bridge — it forwards the video and receives structured results. The specific ML provider (custom model, third-party API) is an implementation decision deferred to build time.
- Video files are stored in a dedicated Supabase Storage bucket with RLS policies ensuring users can only access their own uploads.
- Large video files should be compressed/trimmed on the client before upload to reduce storage costs and processing time.
