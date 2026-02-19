/**
 * Type definitions for user profiles, friend requests, and friendships.
 *
 * Profiles extend Supabase Auth's `auth.users` with app-specific data.
 * Friend requests model the bidirectional friendship lifecycle.
 */

/**
 * A user's public profile information.
 *
 * The `id` references the corresponding `auth.users.id` in Supabase.
 */
export interface Profile {
  id: string;
  username: string;
  avatarUrl: string | null;
  createdAt: string;
}

/** Possible states of a friend request. */
export type FriendRequestStatus = 'pending' | 'accepted' | 'declined';

/**
 * A friend request between two users.
 *
 * `requesterId` is the user who sent the request.
 * `addresseeId` is the user who received the request.
 */
export interface FriendRequest {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: FriendRequestStatus;
  createdAt: string;
}

/**
 * A resolved friendship, combining profile information with the
 * underlying friendship record ID.
 *
 * Used in friend list displays where we need both the friend's
 * profile data and the ability to reference the friendship itself
 * (e.g., for unfriending).
 */
export interface Friend {
  friendshipId: string;
  profile: Profile;
}
