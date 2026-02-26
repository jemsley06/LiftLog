import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../providers/AuthProvider";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { supabase } from "../services/supabase";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { isOnline, isSyncing, triggerSync } = useNetworkStatus();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user?.id]);

  const loadProfile = async () => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();
      setProfile(data);
    } catch (error) {
      // Profile might not exist yet or offline
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            // Navigation handled automatically by RootNavigator auth state
          } catch (error: any) {
            Alert.alert("Error", error.message);
          }
        },
      },
    ]);
  };

  const handleSync = async () => {
    try {
      await triggerSync();
      Alert.alert("Sync Complete", "Your data has been synced.");
    } catch (error: any) {
      Alert.alert("Sync Failed", error.message);
    }
  };

  const username =
    profile?.username || user?.user_metadata?.username || "User";

  return (
    <SafeAreaView className="flex-1 bg-dark-900">
      <ScrollView className="flex-1 px-4">
        {/* Header */}
        <View className="pt-4 pb-6">
          <Text className="text-white text-2xl font-bold">Profile</Text>
        </View>

        {/* Avatar & Name */}
        <View className="items-center mb-6">
          <View className="w-20 h-20 rounded-full bg-primary-600/30 items-center justify-center mb-3">
            <Text className="text-primary-400 text-3xl font-bold">
              {username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text className="text-white text-xl font-bold">{username}</Text>
          <Text className="text-dark-400 text-sm">{user?.email}</Text>
        </View>

        {/* Status Cards */}
        <Card className="mb-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons
                name={isOnline ? "cloud-done-outline" : "cloud-offline-outline"}
                size={20}
                color={isOnline ? "#22C55E" : "#F59E0B"}
              />
              <Text className="text-white text-base ml-3">
                {isOnline ? "Online" : "Offline"}
              </Text>
            </View>
            {isOnline && (
              <Button
                title={isSyncing ? "Syncing..." : "Sync Now"}
                variant="ghost"
                size="sm"
                onPress={handleSync}
                loading={isSyncing}
              />
            )}
          </View>
        </Card>

        {/* Settings Section */}
        <Text className="text-dark-300 text-sm font-semibold mb-2 mt-4">
          Account
        </Text>

        <Card className="mb-6">
          <View className="flex-row items-center py-2">
            <Ionicons name="mail-outline" size={20} color="#64748B" />
            <View className="ml-3">
              <Text className="text-dark-400 text-xs">Email</Text>
              <Text className="text-white text-base">{user?.email}</Text>
            </View>
          </View>

          <View className="h-px bg-dark-700 my-2" />

          <View className="flex-row items-center py-2">
            <Ionicons name="person-outline" size={20} color="#64748B" />
            <View className="ml-3">
              <Text className="text-dark-400 text-xs">Username</Text>
              <Text className="text-white text-base">{username}</Text>
            </View>
          </View>

          <View className="h-px bg-dark-700 my-2" />

          <View className="flex-row items-center py-2">
            <Ionicons name="calendar-outline" size={20} color="#64748B" />
            <View className="ml-3">
              <Text className="text-dark-400 text-xs">Member since</Text>
              <Text className="text-white text-base">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "N/A"}
              </Text>
            </View>
          </View>
        </Card>

        {/* Sign Out */}
        <Button
          title="Sign Out"
          variant="danger"
          onPress={handleSignOut}
          icon={<Ionicons name="log-out-outline" size={18} color="#FFFFFF" />}
          className="mb-8"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
