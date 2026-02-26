import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Card from "../ui/Card";
import SetRow from "./SetRow";
import { calculateStrengthPercentage } from "../../utils/calculations";

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
  previousSets?: SetData[];
  best1RM?: number;
  isActive?: boolean;
  onAddSet?: (weight: number, reps: number, rpe?: number) => void;
  onDeleteSet?: (setId: string) => void;
  onSetSaved?: () => void;
}

export default function ExerciseCard({
  exerciseName,
  muscleGroup,
  sets,
  previousSets,
  best1RM,
  isActive = false,
  onAddSet,
  onDeleteSet,
  onSetSaved,
}: ExerciseCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const lastSavedRef = useRef<{ weight: number; reps: number } | null>(null);

  // Get hint values for next set (from last saved set or previous workout)
  const getHintValues = () => {
    // First priority: last set saved in current workout
    if (lastSavedRef.current) {
      return lastSavedRef.current;
    }
    // Second priority: last set in current workout's sets
    if (sets.length > 0) {
      const last = sets[sets.length - 1];
      return { weight: last.weight, reps: last.reps };
    }
    // Third priority: previous workout data
    if (previousSets && previousSets.length > 0) {
      const last = previousSets[0];
      return { weight: last.weight, reps: last.reps };
    }
    return { weight: undefined, reps: undefined };
  };

  const handleSaveNewSet = (weight: number, reps: number, rpe?: number) => {
    onAddSet?.(weight, reps, rpe);
    lastSavedRef.current = { weight, reps };
    onSetSaved?.();
    // Keep adding mode open — auto re-open for rapid entry
    // A brief delay ensures the new set renders first
    setIsAdding(false);
    setTimeout(() => setIsAdding(true), 100);
  };

  const handleCopyLastSet = () => {
    if (sets.length === 0) return;
    const last = sets[sets.length - 1];
    onAddSet?.(last.weight, last.reps, last.rpe ?? undefined);
    lastSavedRef.current = { weight: last.weight, reps: last.reps };
    onSetSaved?.();
  };

  const hints = getHintValues();

  // Format previous workout summary
  const previousSummary =
    previousSets && previousSets.length > 0
      ? previousSets
          .slice(0, 5)
          .map((s) => `${s.weight}×${s.reps}`)
          .join(", ")
      : null;

  return (
    <Card className="mb-3">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-1">
          <Text className="text-white text-lg font-bold">{exerciseName}</Text>
          <Text className="text-dark-400 text-sm capitalize">{muscleGroup}</Text>
        </View>
        <View className="bg-primary-600/20 px-2.5 py-1 rounded-lg">
          <Text className="text-primary-400 text-xs font-semibold">
            {sets.length} {sets.length === 1 ? "set" : "sets"}
          </Text>
        </View>
      </View>

      {/* Previous workout reference */}
      {previousSummary && sets.length === 0 && (
        <View className="flex-row items-center mb-3 px-1">
          <Ionicons name="time-outline" size={12} color="#475569" />
          <Text className="text-dark-500 text-xs ml-1 italic">
            Last time: {previousSummary}
          </Text>
        </View>
      )}

      {/* Column headers */}
      {sets.length > 0 && (
        <View className="flex-row items-center py-1.5 px-3 mb-1">
          <View className="w-7" />
          <Text className="flex-1 text-dark-500 text-center text-xs font-semibold ml-3">
            WEIGHT
          </Text>
          <View className="mx-1 w-3" />
          <Text className="flex-1 text-dark-500 text-center text-xs font-semibold">
            REPS
          </Text>
          <Text className="text-dark-500 text-xs w-20 text-right font-semibold">
            1RM
          </Text>
          {isActive && <View className="w-7 ml-2" />}
        </View>
      )}

      {/* Set rows */}
      {sets.map((set) => {
        const set1RM = set.calculated1RM || 0;
        const strengthPct =
          best1RM && best1RM > 0 && set1RM > 0
            ? calculateStrengthPercentage(set1RM, best1RM)
            : null;
        const isPR = best1RM != null && set1RM > best1RM;

        return (
          <SetRow
            key={set.id}
            setNumber={set.setNumber}
            weight={set.weight}
            reps={set.reps}
            rpe={set.rpe}
            calculated1RM={set.calculated1RM}
            strengthPct={strengthPct}
            isPR={isPR}
            onDelete={isActive ? () => onDeleteSet?.(set.id) : undefined}
          />
        );
      })}

      {/* Add set input */}
      {isActive && isAdding && (
        <SetRow
          setNumber={sets.length + 1}
          isEditing
          previousWeight={hints.weight}
          previousReps={hints.reps}
          onSave={handleSaveNewSet}
        />
      )}

      {/* Action buttons */}
      {isActive && !isAdding && (
        <View className="flex-row items-center justify-center mt-2 gap-3">
          <TouchableOpacity
            onPress={() => setIsAdding(true)}
            className="flex-row items-center py-2 px-4"
          >
            <Ionicons name="add-circle-outline" size={18} color="#818CF8" />
            <Text className="text-primary-400 font-semibold ml-1.5">
              Add Set
            </Text>
          </TouchableOpacity>

          {sets.length > 0 && (
            <TouchableOpacity
              onPress={handleCopyLastSet}
              className="flex-row items-center py-2 px-4"
            >
              <Ionicons name="copy-outline" size={16} color="#64748B" />
              <Text className="text-dark-400 font-medium ml-1.5 text-sm">
                Copy Last
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Card>
  );
}
