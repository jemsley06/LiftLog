import { supabase } from "./supabase";

/**
 * Subscribe to real-time score updates for a party.
 * Calls the callback whenever a party_member's score changes.
 */
export function subscribeToPartyScores(
  partyId: string,
  callback: (payload: any) => void
) {
  const channel = supabase
    .channel(`party-${partyId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "party_members",
        filter: `party_id=eq.${partyId}`,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to party status changes (e.g., party ended).
 */
export function subscribeToPartyStatus(
  partyId: string,
  callback: (payload: any) => void
) {
  const channel = supabase
    .channel(`party-status-${partyId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "parties",
        filter: `id=eq.${partyId}`,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to incoming friend requests.
 */
export function subscribeToFriendRequests(
  userId: string,
  callback: (payload: any) => void
) {
  const channel = supabase
    .channel(`friends-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "friends",
        filter: `addressee_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
