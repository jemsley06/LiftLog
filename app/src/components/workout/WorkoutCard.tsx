import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Card from "../ui/Card";
import { formatDate, formatDuration } from "../../utils/formatting";

interface WorkoutCardProps {
  name: string | null;
  startedAt: string;
  completedAt: string | null;
  exerciseCount: number;
  setCount: number;
  onPress?: () => void;
}

export default function WorkoutCard({
  name,
  startedAt,
  completedAt,
  exerciseCount,
  setCount,
  onPress,
}: WorkoutCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card className="mb-3">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-white text-lg font-bold">
            {name || "Workout"}
          </Text>
          <Text className="text-dark-400 text-sm">{formatDate(startedAt)}</Text>
        </View>

        <View className="flex-row items-center">
          <View className="flex-row items-center mr-4">
            <Ionicons name="barbell-outline" size={16} color="#64748B" />
            <Text className="text-dark-300 text-sm ml-1">
              {exerciseCount} {exerciseCount === 1 ? "exercise" : "exercises"}
            </Text>
          </View>

          <View className="flex-row items-center mr-4">
            <Ionicons name="layers-outline" size={16} color="#64748B" />
            <Text className="text-dark-300 text-sm ml-1">
              {setCount} {setCount === 1 ? "set" : "sets"}
            </Text>
          </View>

          {completedAt && (
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={16} color="#64748B" />
              <Text className="text-dark-300 text-sm ml-1">
                {formatDuration(startedAt, completedAt)}
              </Text>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
}
