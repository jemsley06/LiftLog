import { supabase } from "./supabase";

// ─── Friends ───

export async function sendFriendRequest(requesterId: string, addresseeUsername: string) {
  // Look up addressee by username
  const { data: profile, error: lookupError } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", addresseeUsername)
    .single();

  if (lookupError || !profile) throw new Error("User not found");
  if (profile.id === requesterId) throw new Error("Cannot friend yourself");

  const { data, error } = await supabase.from("friends").insert({
    requester_id: requesterId,
    addressee_id: profile.id,
    status: "pending",
  });

  if (error) throw error;
  return data;
}

export async function acceptFriendRequest(friendshipId: string) {
  const { data, error } = await supabase
    .from("friends")
    .update({ status: "accepted" })
    .eq("id", friendshipId);

  if (error) throw error;
  return data;
}

export async function declineFriendRequest(friendshipId: string) {
  const { data, error } = await supabase
    .from("friends")
    .update({ status: "declined" })
    .eq("id", friendshipId);

  if (error) throw error;
  return data;
}

export async function removeFriend(friendshipId: string) {
  const { error } = await supabase
    .from("friends")
    .delete()
    .eq("id", friendshipId);

  if (error) throw error;
}

export async function getFriends(userId: string) {
  const { data, error } = await supabase
    .from("friends")
    .select(`
      id,
      requester_id,
      addressee_id,
      status,
      created_at,
      requester:profiles!friends_requester_id_fkey(id, username, avatar_url),
      addressee:profiles!friends_addressee_id_fkey(id, username, avatar_url)
    `)
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .eq("status", "accepted");

  if (error) throw error;
  return data;
}

export async function getPendingRequests(userId: string) {
  const { data, error } = await supabase
    .from("friends")
    .select(`
      id,
      requester_id,
      addressee_id,
      status,
      created_at,
      requester:profiles!friends_requester_id_fkey(id, username, avatar_url)
    `)
    .eq("addressee_id", userId)
    .eq("status", "pending");

  if (error) throw error;
  return data;
}

// ─── Parties ───

export async function createParty(name: string, creatorId: string) {
  const { data: party, error: partyError } = await supabase
    .from("parties")
    .insert({
      name,
      created_by: creatorId,
      is_active: true,
    })
    .select()
    .single();

  if (partyError) throw partyError;

  // Auto-join creator
  const { error: joinError } = await supabase.from("party_members").insert({
    party_id: party.id,
    user_id: creatorId,
    score: 0,
  });

  if (joinError) throw joinError;
  return party;
}

export async function joinParty(partyId: string, userId: string) {
  const { error } = await supabase.from("party_members").insert({
    party_id: partyId,
    user_id: userId,
    score: 0,
  });

  if (error) throw error;
}

export async function endParty(partyId: string) {
  const { error } = await supabase
    .from("parties")
    .update({ is_active: false, ended_at: new Date().toISOString() })
    .eq("id", partyId);

  if (error) throw error;
}

export async function getActiveParties(userId: string) {
  const { data, error } = await supabase
    .from("party_members")
    .select(`
      party_id,
      score,
      parties(id, name, created_by, started_at, is_active,
        party_members(count)
      )
    `)
    .eq("user_id", userId)
    .eq("parties.is_active", true);

  if (error) throw error;
  return data;
}

export async function getPartyMembers(partyId: string) {
  const { data, error } = await supabase
    .from("party_members")
    .select(`
      id,
      user_id,
      score,
      joined_at,
      profiles:profiles!party_members_user_id_fkey(id, username, avatar_url)
    `)
    .eq("party_id", partyId)
    .order("score", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getPartyHistory(userId: string) {
  const { data, error } = await supabase
    .from("party_members")
    .select(`
      party_id,
      score,
      parties(id, name, created_by, started_at, ended_at, is_active)
    `)
    .eq("user_id", userId)
    .eq("parties.is_active", false)
    .order("parties(ended_at)", { ascending: false });

  if (error) throw error;
  return data;
}

// ─── Party Invites ───

export async function sendPartyInvites(
  partyId: string,
  invitedBy: string,
  friendIds: string[]
) {
  const rows = friendIds.map((id) => ({
    party_id: partyId,
    invited_by: invitedBy,
    invited_user: id,
    status: "pending",
  }));
  const { error } = await supabase.from("party_invites").insert(rows);
  if (error) throw error;
}

export async function acceptPartyInvite(inviteId: string, userId: string) {
  const { data: invite, error: updateError } = await supabase
    .from("party_invites")
    .update({ status: "accepted" })
    .eq("id", inviteId)
    .select("party_id")
    .single();

  if (updateError) throw updateError;

  // Auto-join the party
  const { error: joinError } = await supabase.from("party_members").insert({
    party_id: invite.party_id,
    user_id: userId,
    score: 0,
  });

  if (joinError) throw joinError;
}

export async function declinePartyInvite(inviteId: string) {
  const { error } = await supabase
    .from("party_invites")
    .update({ status: "declined" })
    .eq("id", inviteId);

  if (error) throw error;
}

export async function getPendingPartyInvites(userId: string) {
  const { data, error } = await supabase
    .from("party_invites")
    .select(`
      id,
      party_id,
      invited_by,
      status,
      created_at,
      parties(id, name, created_by, is_active),
      inviter:profiles!party_invites_invited_by_fkey(id, username, avatar_url)
    `)
    .eq("invited_user", userId)
    .eq("status", "pending");

  if (error) throw error;
  return data;
}
