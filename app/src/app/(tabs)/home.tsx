import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../providers/AuthProvider";
import { useWorkout } from "../../hooks/useWorkout";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import Button from "../../components/ui/Button";
import ExerciseCard from "../../components/workout/ExerciseCard";
import ExercisePicker from "../../components/workout/ExercisePicker";
import RestTimer from "../../components/workout/RestTimer";
import { Ionicons } from "@expo/vector-icons";
import { getAllExercises } from "../../services/exercises";

interface SelectedExercise {
  id: string;
  name: string;
  muscleGroup: string;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { isOnline } = useNetworkStatus();
  const {
    activeWorkout,
    isWorkoutActive,
    startWorkout,
    finishWorkout,
    addSet,
    removeSet,
    sets,
    exerciseSets,
  } = useWorkout();

  const [showPicker, setShowPicker] = useState(false);
  const [exercises, setExercises] = useState<Map<string, SelectedExercise>>(
    new Map()
  );

  const handleStartWorkout = async () => {
    try {
      await startWorkout();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleFinishWorkout = () => {
    Alert.alert(
      "Finish Workout",
      "Are you sure you want to finish this workout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Finish",
          onPress: async () => {
            try {
              await finishWorkout();
              setExercises(new Map());
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ]
    );
  };

  const handleSelectExercise = (exercise: SelectedExercise) => {
    setExercises((prev) => new Map(prev).set(exercise.id, exercise));
  };

  const handleAddSet = async (
    exerciseId: string,
    weight: number,
    reps: number,
    rpe?: number
  ) => {
    const exerciseSetCount = (exerciseSets[exerciseId] || []).length;
    await addSet(exerciseId, exerciseSetCount + 1, weight, reps, rpe);
  };

  return (
    <SafeAreaView className="flex-1 bg-dark-900">
      <ScrollView className="flex-1 px-4">
        {/* Header */}
        <View className="flex-row items-center justify-between py-4">
          <View>
            <Text className="text-dark-400 text-sm">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </Text>
            <Text className="text-white text-2xl font-bold mt-1">
              {isWorkoutActive ? "Workout In Progress" : "Ready to Lift?"}
            </Text>
          </View>
          {!isOnline && (
            <View className="bg-warning/20 px-2 py-1 rounded-lg">
              <Text className="text-warning text-xs font-semibold">
                Offline
              </Text>
            </View>
          )}
        </View>

        {/* Not working out state */}
        {!isWorkoutActive && (
          <View className="items-center py-16">
            <Ionicons name="barbell-outline" size={64} color="#334155" />
            <Text className="text-dark-400 text-lg mt-4 mb-6 text-center">
              Start a workout to begin logging sets
            </Text>
            <Button
              title="Start Workout"
              onPress={handleStartWorkout}
              size="lg"
              icon={
                <Ionicons name="play" size={18} color="#FFFFFF" />
              }
            />
          </View>
        )}

        {/* Active workout */}
        {isWorkoutActive && (
          <>
            {/* Rest Timer */}
            <RestTimer />

            {/* Exercise cards */}
            <View className="mt-4">
              {Array.from(exercises.values()).map((exercise) => {
                const setsForExercise = (exerciseSets[exercise.id] || []).map(
                  (s: any) => ({
                    id: s.id,
                    setNumber: s.setNumber,
                    weight: s.weight,
                    reps: s.reps,
                    rpe: s.rpe,
                    calculated1RM: s.calculated1RM,
                  })
                );

                return (
                  <ExerciseCard
                    key={exercise.id}
                    exerciseName={exercise.name}
                    muscleGroup={exercise.muscleGroup}
                    sets={setsForExercise}
                    isActive
                    onAddSet={(weight, reps, rpe) =>
                      handleAddSet(exercise.id, weight, reps, rpe)
                    }
                    onDeleteSet={(setId) => removeSet(setId)}
                  />
                );
              })}
            </View>

            {/* Add Exercise button */}
            <Button
              title="Add Exercise"
              variant="outline"
              onPress={() => setShowPicker(true)}
              icon={
                <Ionicons name="add" size={18} color="#818CF8" />
              }
              className="mt-2 mb-3"
            />

            {/* Finish Workout */}
            <Button
              title="Finish Workout"
              variant="secondary"
              onPress={handleFinishWorkout}
              icon={
                <Ionicons name="checkmark-circle-outline" size={18} color="#F1F5F9" />
              }
              className="mb-8"
            />
          </>
        )}
      </ScrollView>

      {/* Exercise Picker Modal */}
      <ExercisePicker
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleSelectExercise}
      />
    </SafeAreaView>
  );
}
