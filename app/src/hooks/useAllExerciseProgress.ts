import { useState, useEffect } from "react";
import { useAuth } from "../providers/AuthProvider";
import { getExerciseProgress } from "../services/progress";
import { percentageChange } from "../utils/calculations";
import { database } from "../db";

export interface ExerciseProgressSummary {
  exerciseId: string;
  exerciseName: string;
  currentBest1RM: number;
  periodStart1RM: number;
  changePct: number;
  workoutsInPeriod: number;
}

type TimePeriod = "1W" | "1M" | "3M" | "6M" | "All";

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

export function useAllExerciseProgress(timePeriod: TimePeriod) {
  const { user } = useAuth();
  const [data, setData] = useState<ExerciseProgressSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setData([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        // Get all sets to find exercises with data
        const setsCol = database.get("sets");
        const allSets = await setsCol.query(() => true);
        const exerciseIds = [...new Set(allSets.map((s: any) => s.exercise_id))];

        const exercisesCol = database.get("exercises");
        const cutoff = getCutoffDate(timePeriod);
        const results: ExerciseProgressSummary[] = [];

        for (const exerciseId of exerciseIds) {
          const exercise = await exercisesCol.find(exerciseId);
          if (!exercise) continue;

          const progress = await getExerciseProgress(exerciseId, user.id);
          if (progress.length === 0) continue;

          // Filter by time period
          const filtered = cutoff
            ? progress.filter((p) => p.date >= cutoff)
            : progress;

          if (filtered.length === 0) continue;

          const first1RM = filtered[0].best1RM;
          const current1RM = filtered[filtered.length - 1].best1RM;
          const change = percentageChange(first1RM, current1RM);

          results.push({
            exerciseId,
            exerciseName: (exercise as any).name || "Unknown",
            currentBest1RM: current1RM,
            periodStart1RM: first1RM,
            changePct: change,
            workoutsInPeriod: filtered.length,
          });
        }

        // Sort by most improved first
        results.sort((a, b) => b.changePct - a.changePct);

        if (!cancelled) {
          setData(results);
        }
      } catch (error) {
        console.error("Failed to load all exercise progress:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, timePeriod]);

  return { data, loading };
}
