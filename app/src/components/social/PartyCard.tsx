import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Card from "../ui/Card";
import Badge from "../ui/Badge";

interface PartyCardProps {
  name: string;
  memberCount: number;
  isActive: boolean;
  userScore?: number;
  onPress?: () => void;
}

export default function PartyCard({
  name,
  memberCount,
  isActive,
  userScore,
  onPress,
}: PartyCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card className="mb-3">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <Ionicons
              name="people"
              size={20}
              color={isActive ? "#818CF8" : "#64748B"}
            />
            <Text className="text-white text-lg font-bold ml-2">{name}</Text>
          </View>
          <Badge
            label={isActive ? "Live" : "Ended"}
            variant={isActive ? "success" : "default"}
          />
        </View>

        <View className="flex-row items-center">
          <Text className="text-dark-400 text-sm">
            {memberCount} {memberCount === 1 ? "member" : "members"}
          </Text>
          {userScore !== undefined && (
            <Text className="text-primary-400 text-sm font-semibold ml-4">
              Your score: {Math.round(userScore)}
            </Text>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
}
