import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { formatWeight, formatPercentage } from "../../utils/formatting";

interface ExerciseSummaryProps {
  exerciseName: string;
  best1RM: number;
  bestWeight: number;
  bestReps: number;
  change1RM: number;
  isPlateaued: boolean;
  totalSets: number;
}

export default function ExerciseSummary({
  exerciseName,
  best1RM,
  bestWeight,
  bestReps,
  change1RM,
  isPlateaued,
  totalSets,
}: ExerciseSummaryProps) {
  const isImproved = change1RM > 0;
  const isDeclined = change1RM < 0;

  return (
    <Card className="mb-3">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-white text-base font-bold flex-1">
          {exerciseName}
        </Text>
        {isPlateaued && <Badge label="Plateau" variant="warning" />}
      </View>

      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-dark-400 text-xs mb-0.5">Best Set</Text>
          <Text className="text-white text-sm">
            {formatWeight(bestWeight)} × {bestReps}
          </Text>
        </View>

        <View className="items-center">
          <Text className="text-dark-400 text-xs mb-0.5">Est. 1RM</Text>
          <Text className="text-white text-sm font-bold">
            {formatWeight(Math.round(best1RM))}
          </Text>
        </View>

        <View className="items-end">
          <Text className="text-dark-400 text-xs mb-0.5">Change</Text>
          <View className="flex-row items-center">
            <Ionicons
              name={
                isImproved
                  ? "arrow-up"
                  : isDeclined
                    ? "arrow-down"
                    : "remove"
              }
              size={14}
              color={
                isImproved ? "#22C55E" : isDeclined ? "#EF4444" : "#64748B"
              }
            />
            <Text
              className={`text-sm font-bold ml-0.5 ${
                isImproved
                  ? "text-success"
                  : isDeclined
                    ? "text-error"
                    : "text-dark-400"
              }`}
            >
              {formatPercentage(change1RM)}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
}
