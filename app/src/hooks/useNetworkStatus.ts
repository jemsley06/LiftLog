import { useState, useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";
import { sync } from "../db/sync";

/**
 * Monitors network connectivity and triggers sync when reconnected.
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const wasOffline = !isOnline;
      const nowOnline = !!(state.isConnected && state.isInternetReachable);

      setIsOnline(nowOnline);

      // Trigger sync when reconnecting
      if (wasOffline && nowOnline) {
        triggerSync();
      }
    });

    return () => unsubscribe();
  }, [isOnline]);

  const triggerSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await sync();
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isOnline,
    isSyncing,
    triggerSync,
  };
}
