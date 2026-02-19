/**
 * Navigation type definitions for Expo Router.
 *
 * Expo Router uses file-based routing, so most route types are
 * inferred automatically. This file provides explicit type
 * definitions for routes that accept parameters, enabling
 * type-safe navigation with `router.push()` and `useLocalSearchParams()`.
 */

/**
 * Route parameters for screens that accept dynamic data.
 *
 * Each key corresponds to a route path, and its value defines
 * the expected search/route parameters for that screen.
 */
export type RouteParams = {
  /** Workout detail screen — views a specific workout by ID. */
  '/workout/[id]': { id: string };

  /** Exercise history screen — views history for a specific exercise. */
  '/exercise/[id]': { id: string };

  /** Party detail screen — views an active or completed party. */
  '/party/[id]': { id: string };
};
