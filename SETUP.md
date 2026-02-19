# LiftLog — Setup Guide

Complete setup instructions for developing and running the LiftLog workout tracking app.

## Prerequisites

- **Node.js** >= 18 (LTS recommended)
- **npm** >= 9
- **Expo CLI**: `npm install -g expo-cli` (optional — can use `npx expo` instead)
- **Supabase CLI**: [Install instructions](https://supabase.com/docs/guides/cli/getting-started)
- **iOS Simulator** (macOS only) or **Android Emulator** or **Expo Go** on a physical device

---

## 1. Supabase Setup (Backend)

### Option A: Supabase Cloud (Recommended for deployment)

1. **Create a Supabase project** at [supabase.com/dashboard](https://supabase.com/dashboard).

2. **Run the migrations** in order. Go to the SQL Editor in the Supabase Dashboard and execute each file in `server/supabase/migrations/` sequentially:

   ```
   00001_create_profiles.sql
   00002_create_exercises.sql
   00003_create_workouts.sql
   00004_create_sets.sql
   00005_create_friends.sql
   00006_create_parties.sql
   00007_create_rls_policies.sql
   ```

   **Important:** Run them in order — later migrations reference tables from earlier ones.

3. **Seed the exercise library.** Run the contents of `server/supabase/seed.sql` in the SQL Editor. This inserts the default exercise library (46 exercises across 6 muscle groups).

4. **Deploy Edge Functions** (optional — needed for party scoring, plateau detection, and workout summaries):

   ```bash
   cd server
   supabase functions deploy calculate-party-scores
   supabase functions deploy detect-plateaus
   supabase functions deploy generate-workout-summary
   ```

5. **Note your credentials** from the Supabase Dashboard → Settings → API:
   - `Project URL` (e.g., `https://xxxx.supabase.co`)
   - `anon` public key

### Option B: Supabase Local Development

1. **Start Supabase locally:**

   ```bash
   cd server
   supabase init  # if not already initialized
   supabase start
   ```

2. **Run migrations:**

   ```bash
   supabase db reset  # applies all migrations + seed data
   ```

3. **Local credentials** will be printed when you run `supabase start`:
   - API URL: `http://localhost:54321`
   - `anon` key: (printed in output)

---

## 2. App Configuration

1. **Navigate to the app directory:**

   ```bash
   cd app
   ```

2. **Create your `.env` file** from the example:

   ```bash
   cp .env.example .env
   ```

3. **Edit `.env`** and fill in your Supabase credentials:

   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

   For local development, use the values from `supabase start`:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-local-anon-key>
   ```

---

## 3. Install Dependencies

```bash
cd app
npm install --legacy-peer-deps
```

The `--legacy-peer-deps` flag is needed due to peer dependency conflicts between some React Native packages.

---

## 4. Running the App

### iOS Simulator (macOS)

```bash
cd app
npx expo start --ios
```

### Android Emulator

```bash
cd app
npx expo start --android
```

### Expo Go (Physical Device)

```bash
cd app
npx expo start
```

Then scan the QR code with:
- **iOS:** Camera app
- **Android:** Expo Go app

### Web (for quick testing)

```bash
cd app
npx expo start --web
```

> **Note:** WatermelonDB (SQLite) does not work on web. The web version will have limited functionality. Use iOS/Android for full offline-first support.

---

## 5. Project Structure

```
LiftLog/
├── app/                          # React Native mobile app (Expo)
│   ├── src/
│   │   ├── app/                  # Expo Router screens & layouts
│   │   │   ├── _layout.tsx       # Root layout (providers, auth gate)
│   │   │   ├── index.tsx         # Entry redirect
│   │   │   ├── (auth)/           # Auth screens (sign-in, sign-up)
│   │   │   └── (tabs)/           # Main app tabs (home, history, social, profile)
│   │   ├── components/           # UI components (ui/, workout/, progress/, social/)
│   │   ├── hooks/                # Custom React hooks
│   │   ├── db/                   # WatermelonDB (schema, models, sync)
│   │   ├── services/             # API & data layer
│   │   ├── providers/            # React context providers
│   │   ├── utils/                # Pure utility functions
│   │   ├── constants/            # App-wide constants
│   │   └── types/                # TypeScript type definitions
│   ├── app.json                  # Expo configuration
│   ├── tailwind.config.js        # NativeWind theme
│   ├── babel.config.js           # Babel config (NativeWind + decorators)
│   ├── metro.config.js           # Metro bundler config
│   └── package.json
├── server/                       # Supabase backend
│   ├── config.toml               # Supabase local config
│   └── supabase/
│       ├── migrations/           # SQL schema migrations (7 files)
│       ├── seed.sql              # Default exercise library
│       └── functions/            # Edge Functions (Deno/TypeScript)
├── architecture.md               # Technical architecture document
├── spec.md                       # Product specification
├── todo.md                       # Build task tracking
└── SETUP.md                      # This file
```

---

## 6. Key Features

| Feature | Status | Notes |
|---------|--------|-------|
| User Auth (sign up/in/out) | Ready | Supabase Auth with secure token storage |
| Workout Logging | Ready | Create workouts, log sets with weight/reps |
| 1RM Calculation (Brzycki) | Ready | Automatic on every set |
| Exercise Library | Ready | 46 default exercises, custom exercise support |
| Progress Charts | Ready | 1RM and volume trends over time |
| Workout History | Ready | Full history with exercise/set counts |
| Offline Support | Ready | WatermelonDB (SQLite) for local storage |
| Background Sync | Ready | Auto-sync to Supabase when online |
| Friends | Ready | Send/accept/decline friend requests |
| Group Lifts (Parties) | Ready | Create parties, intensity-based scoring |
| Real-time Leaderboard | Ready | Live score updates via Supabase Realtime |
| Progressive Overload | Ready | Plateau detection + weight increase prompts |
| Rest Timer | Ready | Configurable countdown between sets |

---

## 7. Troubleshooting

### "Module not found" errors
```bash
cd app
rm -rf node_modules
npm install --legacy-peer-deps
npx expo start -c  # clear cache
```

### WatermelonDB JSI errors on web
WatermelonDB uses native SQLite which is not available on web. Use iOS/Android simulators or physical devices.

### Supabase connection issues
- Verify your `.env` file has the correct URL and anon key
- For local dev, ensure `supabase start` is running
- Check that RLS policies are applied (migration 00007)

### Metro bundler cache issues
```bash
npx expo start -c
```

---

## 8. Environment Variables Reference

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous (public) API key |
