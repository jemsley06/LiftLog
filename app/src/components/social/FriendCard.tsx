import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Card from "../ui/Card";

interface FriendCardProps {
  username: string;
  avatarUrl?: string | null;
  isPending?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  onRemove?: () => void;
  onPress?: () => void;
}

export default function FriendCard({
  username,
  avatarUrl,
  isPending = false,
  onAccept,
  onDecline,
  onRemove,
  onPress,
}: FriendCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <Card className="mb-2">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-primary-600/30 items-center justify-center">
            <Text className="text-primary-400 font-bold text-lg">
              {username.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View className="flex-1 ml-3">
            <Text className="text-white text-base font-semibold">
              {username}
            </Text>
            {isPending && (
              <Text className="text-dark-400 text-xs">Pending request</Text>
            )}
          </View>

          {isPending && onAccept && onDecline && (
            <View className="flex-row">
              <TouchableOpacity
                onPress={onAccept}
                className="bg-success/20 rounded-lg px-3 py-1.5 mr-2"
              >
                <Text className="text-success font-semibold text-sm">
                  Accept
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onDecline}
                className="bg-dark-700 rounded-lg px-3 py-1.5"
              >
                <Text className="text-dark-300 font-semibold text-sm">
                  Decline
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {!isPending && onRemove && (
            <TouchableOpacity onPress={onRemove}>
              <Ionicons name="person-remove-outline" size={18} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
}
