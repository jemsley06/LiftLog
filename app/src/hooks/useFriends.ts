import { useState, useEffect, useCallback } from "react";
import {
  getFriends,
  getPendingRequests,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
} from "../services/social";
import { subscribeToFriendRequests } from "../services/realtime";
import { useAuth } from "../providers/AuthProvider";

export function useFriends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [friendsData, pendingData] = await Promise.all([
        getFriends(user.id),
        getPendingRequests(user.id),
      ]);
      setFriends(friendsData || []);
      setPendingRequests(pendingData || []);
    } catch (error) {
      console.error("Failed to load friends:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Subscribe to real-time friend request notifications
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToFriendRequests(user.id, () => {
      refresh();
    });
    return unsubscribe;
  }, [user?.id, refresh]);

  const sendRequest = useCallback(
    async (username: string) => {
      if (!user) return;
      await sendFriendRequest(user.id, username);
      await refresh();
    },
    [user?.id, refresh]
  );

  const acceptRequest = useCallback(
    async (friendshipId: string) => {
      await acceptFriendRequest(friendshipId);
      await refresh();
    },
    [refresh]
  );

  const declineRequest = useCallback(
    async (friendshipId: string) => {
      await declineFriendRequest(friendshipId);
      await refresh();
    },
    [refresh]
  );

  const remove = useCallback(
    async (friendshipId: string) => {
      await removeFriend(friendshipId);
      await refresh();
    },
    [refresh]
  );

  return {
    friends,
    pendingRequests,
    loading,
    refresh,
    sendRequest,
    acceptRequest,
    declineRequest,
    removeFriend: remove,
  };
}
