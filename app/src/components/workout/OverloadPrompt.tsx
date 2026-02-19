import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Card from "../ui/Card";
import { suggestWeightIncrease } from "../../utils/calculations";

interface OverloadPromptProps {
  exerciseName: string;
  muscleGroup: string;
  currentWeight: number;
  onDismiss: () => void;
}

export default function OverloadPrompt({
  exerciseName,
  muscleGroup,
  currentWeight,
  onDismiss,
}: OverloadPromptProps) {
  const suggestedWeight = suggestWeightIncrease(currentWeight, muscleGroup);

  return (
    <Card className="mb-3 border-warning/30 bg-warning/5">
      <View className="flex-row items-start">
        <Ionicons name="trending-up" size={24} color="#F59E0B" />
        <View className="flex-1 ml-3">
          <Text className="text-warning font-bold text-base mb-1">
            Time to Level Up!
          </Text>
          <Text className="text-dark-300 text-sm mb-2">
            You've been lifting {currentWeight} lbs on {exerciseName} for
            multiple sessions. Try bumping up to{" "}
            <Text className="text-white font-semibold">
              {suggestedWeight} lbs
            </Text>
            .
          </Text>
          <TouchableOpacity onPress={onDismiss}>
            <Text className="text-dark-400 text-sm">Dismiss</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
}
