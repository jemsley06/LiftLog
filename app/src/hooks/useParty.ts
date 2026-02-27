import { useState, useEffect, useCallback } from "react";
import {
  createParty,
  joinParty,
  endParty,
  getActiveParties,
  getPartyMembers,
  sendPartyInvites,
  acceptPartyInvite,
  declinePartyInvite,
  getPendingPartyInvites,
} from "../services/social";
import {
  subscribeToPartyScores,
  subscribeToPartyStatus,
  subscribeToPartyInvites,
  subscribeToPartyMembers,
} from "../services/realtime";
import { useAuth } from "../providers/AuthProvider";

export function useParty(partyId?: string) {
  const { user } = useAuth();
  const [activeParties, setActiveParties] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load active parties
  const refreshParties = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getActiveParties(user.id);
      setActiveParties(data || []);
    } catch (error) {
      console.error("Failed to load parties:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Load party members
  const refreshMembers = useCallback(async () => {
    if (!partyId) return;
    try {
      const data = await getPartyMembers(partyId);
      setMembers(data || []);
    } catch (error) {
      console.error("Failed to load party members:", error);
    }
  }, [partyId]);

  // Load pending invites
  const refreshInvites = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getPendingPartyInvites(user.id);
      setPendingInvites(data || []);
    } catch (error) {
      console.error("Failed to load party invites:", error);
    }
  }, [user?.id]);

  useEffect(() => {
    refreshParties();
  }, [refreshParties]);

  useEffect(() => {
    refreshMembers();
  }, [refreshMembers]);

  useEffect(() => {
    refreshInvites();
  }, [refreshInvites]);

  // Real-time score updates
  useEffect(() => {
    if (!partyId) return;
    const unsubscribe = subscribeToPartyScores(partyId, () => {
      refreshMembers();
    });
    return unsubscribe;
  }, [partyId, refreshMembers]);

  // Real-time party status
  useEffect(() => {
    if (!partyId) return;
    const unsubscribe = subscribeToPartyStatus(partyId, () => {
      refreshParties();
      refreshMembers();
    });
    return unsubscribe;
  }, [partyId, refreshParties, refreshMembers]);

  // Real-time party member changes (joins/leaves)
  useEffect(() => {
    if (!partyId) return;
    const unsubscribe = subscribeToPartyMembers(partyId, () => {
      refreshMembers();
      refreshParties();
    });
    return unsubscribe;
  }, [partyId, refreshMembers, refreshParties]);

  // Real-time invite notifications
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToPartyInvites(user.id, () => {
      refreshInvites();
    });
    return unsubscribe;
  }, [user?.id, refreshInvites]);

  const create = useCallback(
    async (name: string) => {
      if (!user) return;
      const party = await createParty(name, user.id);
      await refreshParties();
      return party;
    },
    [user?.id, refreshParties]
  );

  const join = useCallback(
    async (id: string) => {
      if (!user) return;
      await joinParty(id, user.id);
      await refreshParties();
    },
    [user?.id, refreshParties]
  );

  const end = useCallback(
    async (id: string) => {
      await endParty(id);
      await refreshParties();
    },
    [refreshParties]
  );

  const invite = useCallback(
    async (targetPartyId: string, friendIds: string[]) => {
      if (!user) return;
      await sendPartyInvites(targetPartyId, user.id, friendIds);
    },
    [user?.id]
  );

  const acceptInvite = useCallback(
    async (inviteId: string) => {
      if (!user) return;
      await acceptPartyInvite(inviteId, user.id);
      await refreshInvites();
      await refreshParties();
    },
    [user?.id, refreshInvites, refreshParties]
  );

  const declineInvite = useCallback(
    async (inviteId: string) => {
      await declinePartyInvite(inviteId);
      await refreshInvites();
    },
    [refreshInvites]
  );

  return {
    activeParties,
    members,
    pendingInvites,
    loading,
    refreshParties,
    refreshMembers,
    refreshInvites,
    createParty: create,
    joinParty: join,
    endParty: end,
    inviteFriends: invite,
    acceptInvite,
    declineInvite,
  };
}
