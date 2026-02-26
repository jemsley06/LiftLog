/**
 * Type definitions for parties (group lift competitions) and their members.
 *
 * Parties are real-time, online-only features where users compete
 * against each other in scored sessions based on set intensity.
 */

import { Profile } from './user';

/**
 * A group lift competition session.
 *
 * `endedAt` is `null` while the party is still active.
 * `isActive` is `true` until any user ends the session.
 */
export interface Party {
  id: string;
  name: string;
  createdBy: string;
  startedAt: string;
  endedAt: string | null;
  isActive: boolean;
}

/**
 * A participant in a party.
 *
 * `score` is a running total updated by the `calculate-party-scores`
 * Edge Function each time the member logs a set during the party.
 * `profile` contains the member's display information.
 */
export interface PartyMember {
  id: string;
  partyId: string;
  userId: string;
  score: number;
  joinedAt: string;
  profile: Profile;
}

/**
 * A party with its full list of members.
 *
 * Used for rendering the party detail view with the leaderboard.
 */
export interface PartyWithMembers {
  party: Party;
  members: PartyMember[];
}

export type PartyInviteStatus = 'pending' | 'accepted' | 'declined';

export interface PartyInvite {
  id: string;
  partyId: string;
  invitedBy: string;
  invitedUser: string;
  status: PartyInviteStatus;
  createdAt: string;
}
