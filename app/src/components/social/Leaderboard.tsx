import React from "react";
import { View, Text, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Card from "../ui/Card";

interface LeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  rank: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
}

function getMedalColor(rank: number): string {
  if (rank === 1) return "#FFD700";
  if (rank === 2) return "#C0C0C0";
  if (rank === 3) return "#CD7F32";
  return "#64748B";
}

export default function Leaderboard({
  entries,
  currentUserId,
}: LeaderboardProps) {
  return (
    <Card padding="sm">
      <Text className="text-white text-lg font-bold px-3 pt-2 pb-3">
        Leaderboard
      </Text>
      <FlatList
        data={entries}
        scrollEnabled={false}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => {
          const isMe = item.userId === currentUserId;
          return (
            <View
              className={`flex-row items-center py-3 px-3 ${
                isMe ? "bg-primary-600/10 rounded-xl" : ""
              }`}
            >
              {item.rank <= 3 ? (
                <Ionicons
                  name="trophy"
                  size={20}
                  color={getMedalColor(item.rank)}
                />
              ) : (
                <Text className="text-dark-400 font-bold w-5 text-center">
                  {item.rank}
                </Text>
              )}

              <View className="w-8 h-8 rounded-full bg-dark-700 items-center justify-center ml-3">
                <Text className="text-dark-200 font-bold text-sm">
                  {item.username.charAt(0).toUpperCase()}
                </Text>
              </View>

              <Text
                className={`flex-1 ml-3 font-semibold ${
                  isMe ? "text-primary-400" : "text-white"
                }`}
              >
                {item.username} {isMe ? "(You)" : ""}
              </Text>

              <Text className="text-white font-bold">
                {Math.round(item.score)}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text className="text-dark-400 text-center py-8">
            No scores yet — start lifting!
          </Text>
        }
      />
    </Card>
  );
}
