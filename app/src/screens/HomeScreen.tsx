import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../providers/AuthProvider";
import { useWorkout } from "../hooks/useWorkout";
import { useWorkoutContext } from "../providers/WorkoutProvider";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { useTemplates } from "../hooks/useTemplates";
import { getWorkoutSets, getSetsForExercise } from "../services/workouts";
import { getActiveParties } from "../services/social";
import { getBest1RM } from "../services/progress";
import { database } from "../db";
import Button from "../components/ui/Button";
import ExerciseCard from "../components/workout/ExerciseCard";
import ExercisePicker from "../components/workout/ExercisePicker";
import RestTimer, { RestTimerHandle } from "../components/workout/RestTimer";
import TemplatePicker from "../components/workout/TemplatePicker";
import TemplateEditor from "../components/workout/TemplateEditor";

interface SelectedExercise {
  id: string;
  name: string;
  muscleGroup: string;
}

interface PreviousSetData {
  id: string;
  setNumber: number;
  weight: number;
  reps: number;
  rpe?: number | null;
  calculated1RM?: number | null;
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
    activePartyId,
  } = useWorkout();
  const { setActivePartyId } = useWorkoutContext();
  const { templates, createTemplate } = useTemplates();
  const restTimerRef = useRef<RestTimerHandle>(null);

  const [showPicker, setShowPicker] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [exercises, setExercises] = useState<Map<string, SelectedExercise>>(
    new Map()
  );
  const [activePartyName, setActivePartyName] = useState<string | null>(null);
  const [previousSetsMap, setPreviousSetsMap] = useState<
    Record<string, PreviousSetData[]>
  >({});
  const [best1RMMap, setBest1RMMap] = useState<Record<string, number>>({});

  // Recover exercises when an active workout is restored
  useEffect(() => {
    if (!activeWorkout) return;
    if (exercises.size === 0) {
      recoverExercises(activeWorkout.id);
    }
  }, [activeWorkout?.id]);

  const recoverExercises = async (workoutId: string) => {
    try {
      const workoutSets = await getWorkoutSets(workoutId);
      if (workoutSets.length === 0) return;

      const exerciseIds = [
        ...new Set(workoutSets.map((s: any) => s.exercise_id)),
      ];
      const exercisesCol = database.get("exercises");
      const newMap = new Map<string, SelectedExercise>();

      for (const id of exerciseIds) {
        const exercise = await exercisesCol.find(id);
        if (exercise) {
          newMap.set(id, {
            id,
            name: (exercise as any).name,
            muscleGroup: (exercise as any).muscle_group,
          });
        }
      }

      if (newMap.size > 0) {
        setExercises(newMap);
        // Also load previous sets for recovered exercises
        for (const id of exerciseIds) {
          loadPreviousSets(id);
        }
      }
    } catch (error) {
      console.error("Failed to recover exercises:", error);
    }
  };

  const loadPreviousSets = async (exerciseId: string) => {
    try {
      const [prevSets, best] = await Promise.all([
        getSetsForExercise(exerciseId),
        getBest1RM(exerciseId),
      ]);
      const mapped = prevSets.slice(0, 5).map((s: any) => ({
        id: s.id,
        setNumber: s.set_number,
        weight: s.weight,
        reps: s.reps,
        rpe: s.rpe,
        calculated1RM: s.calculated_1rm,
      }));
      setPreviousSetsMap((prev) => ({ ...prev, [exerciseId]: mapped }));
      if (best > 0) {
        setBest1RMMap((prev) => ({ ...prev, [exerciseId]: best }));
      }
    } catch (error) {
      console.error("Failed to load previous sets:", error);
    }
  };

  const beginWorkout = async (partyId?: string, partyName?: string) => {
    try {
      if (partyId) {
        setActivePartyId(partyId);
        setActivePartyName(partyName || null);
      } else {
        setActivePartyId(null);
        setActivePartyName(null);
      }
      await startWorkout();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleStartWorkout = async () => {
    if (!user) return;
    try {
      // Check for active parties
      const parties = await getActiveParties(user.id);
      const active = (parties || []).filter((p: any) => p.parties?.is_active);

      if (active.length > 0) {
        const buttons: any[] = active.map((p: any) => ({
          text: p.parties?.name || "Party",
          onPress: () => beginWorkout(p.party_id, p.parties?.name),
        }));
        buttons.push({
          text: "Solo (No Party)",
          onPress: () => beginWorkout(),
        });
        buttons.push({ text: "Cancel", style: "cancel" });

        Alert.alert(
          "Log for a Party?",
          "Select a party to compete in, or work out solo.",
          buttons
        );
      } else {
        await beginWorkout();
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleStartFromTemplate = async (template: any) => {
    try {
      await startWorkout(template.name);

      const exercisesCol = database.get("exercises");
      const newMap = new Map<string, SelectedExercise>();

      for (const id of template.exercise_ids) {
        const exercise = await exercisesCol.find(id);
        if (exercise) {
          newMap.set(id, {
            id,
            name: (exercise as any).name,
            muscleGroup: (exercise as any).muscle_group,
          });
          loadPreviousSets(id);
        }
      }

      setExercises(newMap);
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
              setActivePartyId(null);
              setActivePartyName(null);
              setExercises(new Map());
              setPreviousSetsMap({});
              setBest1RMMap({});
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ]
    );
  };

  const handleSelectExercise = async (exercise: SelectedExercise) => {
    setExercises((prev) => new Map(prev).set(exercise.id, exercise));
    loadPreviousSets(exercise.id);
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

  const handleSetSaved = () => {
    // Auto-start rest timer after logging a set
    restTimerRef.current?.triggerStart();
  };

  const handleSaveTemplate = async (name: string, exerciseIds: string[]) => {
    try {
      await createTemplate(name, exerciseIds);
      Alert.alert("Saved", `Template "${name}" created!`);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-dark-900">
      <ScrollView className="flex-1 px-4" keyboardShouldPersistTaps="handled">
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
          <View className="items-center py-12">
            <Ionicons name="barbell-outline" size={64} color="#334155" />
            <Text className="text-dark-400 text-lg mt-4 mb-6 text-center">
              Start a workout to begin logging sets
            </Text>
            <Button
              title="Start Workout"
              onPress={handleStartWorkout}
              size="lg"
              icon={<Ionicons name="play" size={18} color="#FFFFFF" />}
              className="mb-3"
            />
            <Button
              title="Start from Template"
              variant="outline"
              onPress={() => setShowTemplatePicker(true)}
              icon={
                <Ionicons
                  name="document-text-outline"
                  size={18}
                  color="#818CF8"
                />
              }
              className="mb-3"
            />
            <Button
              title="Create Template"
              variant="ghost"
              size="sm"
              onPress={() => setShowTemplateEditor(true)}
              icon={
                <Ionicons
                  name="add-circle-outline"
                  size={16}
                  color="#818CF8"
                />
              }
            />
          </View>
        )}

        {/* Active workout */}
        {isWorkoutActive && (
          <>
            {/* Active party indicator */}
            {activePartyId && (
              <View className="bg-primary-600/20 px-3 py-2 rounded-xl mb-3 flex-row items-center">
                <Ionicons name="people" size={16} color="#818CF8" />
                <Text className="text-primary-400 text-sm font-semibold ml-2">
                  Logging for {activePartyName || "party"} — sets are being
                  scored!
                </Text>
              </View>
            )}

            <RestTimer ref={restTimerRef} />

            <View className="mt-4">
              {Array.from(exercises.values()).map((exercise) => {
                const setsForExercise = (
                  exerciseSets[exercise.id] || []
                ).map((s: any) => ({
                  id: s.id,
                  setNumber: s.set_number,
                  weight: s.weight,
                  reps: s.reps,
                  rpe: s.rpe,
                  calculated1RM: s.calculated_1rm,
                }));

                return (
                  <ExerciseCard
                    key={exercise.id}
                    exerciseName={exercise.name}
                    muscleGroup={exercise.muscleGroup}
                    sets={setsForExercise}
                    previousSets={previousSetsMap[exercise.id]}
                    best1RM={best1RMMap[exercise.id]}
                    isActive
                    onAddSet={(weight, reps, rpe) =>
                      handleAddSet(exercise.id, weight, reps, rpe)
                    }
                    onDeleteSet={(setId) => removeSet(setId)}
                    onSetSaved={handleSetSaved}
                  />
                );
              })}
            </View>

            <Button
              title="Add Exercise"
              variant="outline"
              onPress={() => setShowPicker(true)}
              icon={<Ionicons name="add" size={18} color="#818CF8" />}
              className="mt-2 mb-3"
            />

            <Button
              title="Finish Workout"
              variant="secondary"
              onPress={handleFinishWorkout}
              icon={
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color="#F1F5F9"
                />
              }
              className="mb-8"
            />
          </>
        )}
      </ScrollView>

      <ExercisePicker
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleSelectExercise}
      />

      <TemplatePicker
        visible={showTemplatePicker}
        onClose={() => setShowTemplatePicker(false)}
        onSelect={handleStartFromTemplate}
        onManage={() => setShowTemplateEditor(true)}
        templates={templates}
      />

      <TemplateEditor
        visible={showTemplateEditor}
        onClose={() => setShowTemplateEditor(false)}
        onSave={handleSaveTemplate}
      />
    </SafeAreaView>
  );
}
