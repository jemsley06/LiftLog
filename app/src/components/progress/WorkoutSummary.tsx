import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Card from "../ui/Card";
import ExerciseSummary from "./ExerciseSummary";
import type { ExerciseStats } from "../../services/progress";

interface WorkoutSummaryProps {
  workoutName: string;
  duration: string;
  stats: ExerciseStats[];
}

export default function WorkoutSummary({
  workoutName,
  duration,
  stats,
}: WorkoutSummaryProps) {
  const totalSets = stats.reduce((sum, s) => sum + s.totalSets, 0);
  const totalVolume = stats.reduce((sum, s) => sum + s.totalVolume, 0);
  const improvedCount = stats.filter((s) => s.change1RM > 0).length;

  return (
    <ScrollView className="flex-1">
      {/* Header */}
      <Card className="mb-4">
        <Text className="text-white text-2xl font-bold mb-1">
          {workoutName || "Workout"} Complete!
        </Text>
        <View className="flex-row items-center mt-2">
          <View className="flex-1 items-center">
            <Text className="text-dark-400 text-xs">Duration</Text>
            <Text className="text-white text-lg font-bold">{duration}</Text>
          </View>
          <View className="w-px h-8 bg-dark-700" />
          <View className="flex-1 items-center">
            <Text className="text-dark-400 text-xs">Sets</Text>
            <Text className="text-white text-lg font-bold">{totalSets}</Text>
          </View>
          <View className="w-px h-8 bg-dark-700" />
          <View className="flex-1 items-center">
            <Text className="text-dark-400 text-xs">Volume</Text>
            <Text className="text-white text-lg font-bold">
              {Math.round(totalVolume).toLocaleString()}
            </Text>
          </View>
        </View>

        {improvedCount > 0 && (
          <View className="flex-row items-center mt-3 bg-success/10 rounded-lg px-3 py-2">
            <Ionicons name="trophy" size={18} color="#22C55E" />
            <Text className="text-success text-sm font-semibold ml-2">
              {improvedCount} exercise{improvedCount > 1 ? "s" : ""} improved!
            </Text>
          </View>
        )}
      </Card>

      {/* Per-exercise stats */}
      <Text className="text-white text-lg font-bold mb-3">Exercise Breakdown</Text>
      {stats.map((stat) => (
        <ExerciseSummary
          key={stat.exerciseId}
          exerciseName={stat.exerciseName}
          best1RM={stat.currentBest1RM}
          bestWeight={0}
          bestReps={0}
          change1RM={stat.change1RM}
          isPlateaued={stat.isPlateaued}
          totalSets={stat.totalSets}
        />
      ))}
    </ScrollView>
  );
}
