import { useState, useEffect, useCallback } from "react";
import {
  createParty,
  joinParty,
  endParty,
  getActiveParties,
  getPartyMembers,
} from "../services/social";
import {
  subscribeToPartyScores,
  subscribeToPartyStatus,
} from "../services/realtime";
import { useAuth } from "../providers/AuthProvider";

export function useParty(partyId?: string) {
  const { user } = useAuth();
  const [activeParties, setActiveParties] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
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

  useEffect(() => {
    refreshParties();
  }, [refreshParties]);

  useEffect(() => {
    refreshMembers();
  }, [refreshMembers]);

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

  return {
    activeParties,
    members,
    loading,
    refreshParties,
    refreshMembers,
    createParty: create,
    joinParty: join,
    endParty: end,
  };
}
