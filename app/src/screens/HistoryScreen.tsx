import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { useAuth } from "../providers/AuthProvider";
import { getWorkoutHistory, getWorkoutSets } from "../services/workouts";
import { getAllExercises } from "../services/exercises";
import { useProgressData } from "../hooks/useProgressData";
import { useAllExerciseProgress } from "../hooks/useAllExerciseProgress";
import { percentageChange } from "../utils/calculations";
import WorkoutCard from "../components/workout/WorkoutCard";
import ProgressChart from "../components/progress/ProgressChart";
import ExerciseSummary from "../components/progress/ExerciseSummary";
import Card from "../components/ui/Card";

type ViewMode = "history" | "progress";
type TimePeriod = "1W" | "1M" | "3M" | "6M" | "All";

const TIME_PERIODS: TimePeriod[] = ["1W", "1M", "3M", "6M", "All"];

function getCutoffDate(period: TimePeriod): Date | null {
  if (period === "All") return null;
  const now = new Date();
  switch (period) {
    case "1W":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "1M":
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    case "3M":
      return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    case "6M":
      return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
  }
}

export default function HistoryScreen() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>("history");
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [workoutSetCounts, setWorkoutSetCounts] = useState<
    Record<string, { exercises: number; sets: number }>
  >({});
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("All");

  const { data: progressData, loading: progressLoading } =
    useProgressData(selectedExercise);
  const { data: allExerciseProgress, loading: allProgressLoading } =
    useAllExerciseProgress(timePeriod);

  // Filter progress data by time period
  const filteredProgress = useMemo(() => {
    const cutoff = getCutoffDate(timePeriod);
    if (!cutoff) return progressData;
    return progressData.filter((p) => p.date >= cutoff);
  }, [progressData, timePeriod]);

  // Compute progress summary for selected exercise
  const progressSummary = useMemo(() => {
    if (filteredProgress.length < 1) return null;
    const first = filteredProgress[0];
    const last = filteredProgress[filteredProgress.length - 1];
    return {
      startRM: first.best1RM,
      currentRM: last.best1RM,
      change: percentageChange(first.best1RM, last.best1RM),
      workouts: filteredProgress.length,
    };
  }, [filteredProgress]);

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
        const uniqueExercises = new Set(
          sets.map((s: any) => s.exercise_id)
        );
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
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#6366F1"
            />
          }
          renderItem={({ item }) => {
            const counts = workoutSetCounts[item.id] || {
              exercises: 0,
              sets: 0,
            };
            return (
              <WorkoutCard
                name={item.name}
                startedAt={new Date(item.started_at).toISOString()}
                completedAt={
                  item.completed_at
                    ? new Date(item.completed_at).toISOString()
                    : null
                }
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
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#6366F1"
            />
          }
        >
          {/* Time Period Filter */}
          <View className="flex-row items-center mb-3 gap-2">
            {TIME_PERIODS.map((period) => (
              <TouchableOpacity
                key={period}
                onPress={() => setTimePeriod(period)}
                className={`px-3 py-1.5 rounded-full ${
                  timePeriod === period ? "bg-primary-600" : "bg-dark-800"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    timePeriod === period ? "text-white" : "text-dark-400"
                  }`}
                >
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Exercise Selector */}
          <Text className="text-dark-300 text-sm font-medium mb-2">
            Select an exercise to view details
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-4"
          >
            {exercises.slice(0, 20).map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                onPress={() =>
                  setSelectedExercise(
                    selectedExercise === exercise.id ? null : exercise.id
                  )
                }
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

          {/* Single exercise charts */}
          {selectedExercise && (
            <>
              {/* Progress Summary Card */}
              {progressSummary && filteredProgress.length >= 2 && (
                <Card className="mb-3">
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-dark-400 text-xs">
                        1RM Progress
                      </Text>
                      <Text className="text-white text-lg font-bold">
                        {Math.round(progressSummary.startRM)} →{" "}
                        {Math.round(progressSummary.currentRM)} lbs
                      </Text>
                    </View>
                    <View className="items-end">
                      <View className="flex-row items-center">
                        <Ionicons
                          name={
                            progressSummary.change > 0
                              ? "arrow-up"
                              : progressSummary.change < 0
                              ? "arrow-down"
                              : "remove"
                          }
                          size={16}
                          color={
                            progressSummary.change > 0
                              ? "#22C55E"
                              : progressSummary.change < 0
                              ? "#EF4444"
                              : "#64748B"
                          }
                        />
                        <Text
                          className={`text-lg font-bold ml-1 ${
                            progressSummary.change > 0
                              ? "text-success"
                              : progressSummary.change < 0
                              ? "text-error"
                              : "text-dark-400"
                          }`}
                        >
                          {Math.abs(Math.round(progressSummary.change))}%
                        </Text>
                      </View>
                      <Text className="text-dark-500 text-xs">
                        {progressSummary.workouts} workouts
                      </Text>
                    </View>
                  </View>
                </Card>
              )}

              {/* Weight & Reps Combined Chart */}
              <ProgressChart
                title="Weight & Reps Over Time"
                data={filteredProgress.map((p) => ({
                  date: p.date,
                  value: p.bestWeight,
                }))}
                unit="lbs"
                color="#6366F1"
                label="Weight"
                secondaryData={filteredProgress.map((p) => ({
                  date: p.date,
                  value: p.bestReps,
                }))}
                secondaryColor="#22C55E"
                secondaryLabel="Reps"
                secondaryUnit="reps"
              />

              {/* 1RM Chart */}
              <ProgressChart
                title="Estimated 1RM Over Time"
                data={filteredProgress.map((p) => ({
                  date: p.date,
                  value: p.best1RM,
                }))}
                unit="lbs"
              />

              {/* Volume Chart */}
              <ProgressChart
                title="Volume Over Time"
                data={filteredProgress.map((p) => ({
                  date: p.date,
                  value: p.totalVolume,
                }))}
                unit="lbs"
                color="#22C55E"
              />
            </>
          )}

          {/* All-exercise overview when no exercise selected */}
          {!selectedExercise && (
            <>
              {allExerciseProgress.length > 0 ? (
                <>
                  <Text className="text-white text-lg font-bold mb-3">
                    All Exercises
                  </Text>
                  {allExerciseProgress.map((ex) => (
                    <ExerciseSummary
                      key={ex.exerciseId}
                      exerciseName={ex.exerciseName}
                      best1RM={ex.currentBest1RM}
                      bestWeight={0}
                      bestReps={0}
                      change1RM={ex.changePct}
                      isPlateaued={false}
                      totalSets={ex.workoutsInPeriod}
                    />
                  ))}
                </>
              ) : (
                <View className="items-center py-16">
                  <Ionicons
                    name="analytics-outline"
                    size={48}
                    color="#334155"
                  />
                  <Text className="text-dark-400 text-base mt-4">
                    {allProgressLoading
                      ? "Loading progress..."
                      : "No workout data yet. Start logging!"}
                  </Text>
                </View>
              )}
            </>
          )}

          {/* Bottom padding */}
          <View className="h-8" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
