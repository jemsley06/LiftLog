import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../providers/AuthProvider";
import { getWorkoutHistory, getWorkoutSets } from "../../services/workouts";
import { getAllExercises } from "../../services/exercises";
import { useProgressData } from "../../hooks/useProgressData";
import WorkoutCard from "../../components/workout/WorkoutCard";
import ProgressChart from "../../components/progress/ProgressChart";
import Card from "../../components/ui/Card";
import type Workout from "../../db/models/Workout";
import type Exercise from "../../db/models/Exercise";

type ViewMode = "history" | "progress";

export default function HistoryScreen() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>("history");
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [workoutSetCounts, setWorkoutSetCounts] = useState<Record<string, { exercises: number; sets: number }>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const { data: progressData, loading: progressLoading } = useProgressData(selectedExercise);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [workoutData, exerciseData] = await Promise.all([
        getWorkoutHistory(user.id),
        getAllExercises(),
      ]);
      setWorkouts(workoutData);
      setExercises(exerciseData);

      // Load set counts for each workout
      const counts: Record<string, { exercises: number; sets: number }> = {};
      for (const workout of workoutData.slice(0, 20)) {
        const sets = await getWorkoutSets(workout.id);
        const uniqueExercises = new Set(sets.map((s: any) => s.exerciseId));
        counts[workout.id] = {
          exercises: uniqueExercises.size,
          sets: sets.length,
        };
      }
      setWorkoutSetCounts(counts);
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-dark-900">
      {/* Header */}
      <View className="px-4 pt-4 pb-2">
        <Text className="text-white text-2xl font-bold">History</Text>
      </View>

      {/* View Mode Toggle */}
      <View className="flex-row mx-4 mb-4 bg-dark-800 rounded-xl p-1">
        <TouchableOpacity
          onPress={() => setViewMode("history")}
          className={`flex-1 py-2 rounded-lg items-center ${
            viewMode === "history" ? "bg-primary-600" : ""
          }`}
        >
          <Text
            className={`font-semibold ${
              viewMode === "history" ? "text-white" : "text-dark-400"
            }`}
          >
            Workouts
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setViewMode("progress")}
          className={`flex-1 py-2 rounded-lg items-center ${
            viewMode === "progress" ? "bg-primary-600" : ""
          }`}
        >
          <Text
            className={`font-semibold ${
              viewMode === "progress" ? "text-white" : "text-dark-400"
            }`}
          >
            Progress
          </Text>
        </TouchableOpacity>
      </View>

      {viewMode === "history" ? (
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />
          }
          renderItem={({ item }) => {
            const counts = workoutSetCounts[item.id] || { exercises: 0, sets: 0 };
            return (
              <WorkoutCard
                name={(item as any).name}
                startedAt={(item as any).startedAt?.toISOString?.() || new Date().toISOString()}
                completedAt={(item as any).completedAt?.toISOString?.() || null}
                exerciseCount={counts.exercises}
                setCount={counts.sets}
              />
            );
          }}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Ionicons name="time-outline" size={48} color="#334155" />
              <Text className="text-dark-400 text-base mt-4">
                No workouts yet. Start your first one!
              </Text>
            </View>
          }
        />
      ) : (
        <ScrollView
          className="flex-1 px-4"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />
          }
        >
          {/* Exercise Selector */}
          <Text className="text-dark-300 text-sm font-medium mb-2">
            Select an exercise to view progress
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            {exercises.slice(0, 20).map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                onPress={() => setSelectedExercise(exercise.id)}
                className={`mr-2 px-4 py-2 rounded-xl ${
                  selectedExercise === exercise.id
                    ? "bg-primary-600"
                    : "bg-dark-800"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    selectedExercise === exercise.id
                      ? "text-white"
                      : "text-dark-300"
                  }`}
                >
                  {exercise.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Progress Chart */}
          {selectedExercise && (
            <>
              <ProgressChart
                title="Estimated 1RM Over Time"
                data={progressData.map((p) => ({
                  date: p.date,
                  value: p.best1RM,
                }))}
                unit="lbs"
              />
              <ProgressChart
                title="Volume Over Time"
                data={progressData.map((p) => ({
                  date: p.date,
                  value: p.totalVolume,
                }))}
                unit="lbs"
                color="#22C55E"
              />
            </>
          )}

          {!selectedExercise && (
            <View className="items-center py-16">
              <Ionicons name="analytics-outline" size={48} color="#334155" />
              <Text className="text-dark-400 text-base mt-4">
                Select an exercise to view progress charts
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
