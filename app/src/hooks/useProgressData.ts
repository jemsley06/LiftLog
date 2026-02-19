import { useState, useEffect } from "react";
import {
  getExerciseProgress,
  getWorkoutStats,
  type ExerciseProgressPoint,
  type ExerciseStats,
} from "../services/progress";
import { useAuth } from "../providers/AuthProvider";

/**
 * Query transformed data for charts — exercise progress over time.
 */
export function useProgressData(exerciseId: string | null) {
  const { user } = useAuth();
  const [data, setData] = useState<ExerciseProgressPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!exerciseId || !user) {
      setData([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getExerciseProgress(exerciseId, user.id).then((points) => {
      if (!cancelled) {
        setData(points);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [exerciseId, user?.id]);

  return { data, loading };
}

/**
 * Get workout stats for a completed workout.
 */
export function useWorkoutStats(workoutId: string | null) {
  const { user } = useAuth();
  const [stats, setStats] = useState<ExerciseStats[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!workoutId || !user) {
      setStats([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getWorkoutStats(workoutId, user.id).then((data) => {
      if (!cancelled) {
        setStats(data);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [workoutId, user?.id]);

  return { stats, loading };
}
