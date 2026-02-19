import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Card from "../ui/Card";
import SetRow from "./SetRow";

interface SetData {
  id: string;
  setNumber: number;
  weight: number;
  reps: number;
  rpe?: number | null;
  calculated1RM?: number | null;
}

interface ExerciseCardProps {
  exerciseName: string;
  muscleGroup: string;
  sets: SetData[];
  isActive?: boolean;
  onAddSet?: (weight: number, reps: number, rpe?: number) => void;
  onDeleteSet?: (setId: string) => void;
}

export default function ExerciseCard({
  exerciseName,
  muscleGroup,
  sets,
  isActive = false,
  onAddSet,
  onDeleteSet,
}: ExerciseCardProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleSaveNewSet = (weight: number, reps: number, rpe?: number) => {
    onAddSet?.(weight, reps, rpe);
    setIsAdding(false);
  };

  return (
    <Card className="mb-3">
      <View className="flex-row items-center justify-between mb-3">
        <View>
          <Text className="text-white text-lg font-bold">{exerciseName}</Text>
          <Text className="text-dark-400 text-sm capitalize">{muscleGroup}</Text>
        </View>
        <View className="bg-primary-600/20 px-2 py-1 rounded-lg">
          <Text className="text-primary-400 text-xs font-semibold">
            {sets.length} {sets.length === 1 ? "set" : "sets"}
          </Text>
        </View>
      </View>

      {/* Header row */}
      {sets.length > 0 && (
        <View className="flex-row items-center py-1 px-3 mb-1">
          <Text className="text-dark-500 font-bold w-8 text-center text-xs">SET</Text>
          <Text className="flex-1 text-dark-500 text-center text-xs">WEIGHT</Text>
          <Text className="text-dark-500 mx-1 text-xs" />
          <Text className="flex-1 text-dark-500 text-center text-xs">REPS</Text>
          <Text className="text-dark-500 text-sm w-20 text-right text-xs">1RM</Text>
          {isActive && <View className="w-6 ml-2" />}
        </View>
      )}

      {/* Set rows */}
      {sets.map((set) => (
        <SetRow
          key={set.id}
          setNumber={set.setNumber}
          weight={set.weight}
          reps={set.reps}
          rpe={set.rpe}
          calculated1RM={set.calculated1RM}
          onDelete={isActive ? () => onDeleteSet?.(set.id) : undefined}
        />
      ))}

      {/* Add set */}
      {isActive && isAdding && (
        <SetRow
          setNumber={sets.length + 1}
          isEditing
          onSave={handleSaveNewSet}
        />
      )}

      {isActive && !isAdding && (
        <TouchableOpacity
          onPress={() => setIsAdding(true)}
          className="flex-row items-center justify-center py-2 mt-1"
        >
          <Ionicons name="add-circle-outline" size={18} color="#818CF8" />
          <Text className="text-primary-400 font-semibold ml-1">Add Set</Text>
        </TouchableOpacity>
      )}
    </Card>
  );
}
