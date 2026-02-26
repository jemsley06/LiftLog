import { useState, useEffect } from "react";
import { getSetsForExercise } from "../services/workouts";

interface SetData {
  id: string;
  exercise_id: string;
  weight: number;
  reps: number;
  calculated_1rm: number | null;
  [key: string]: any;
}

export function useExerciseHistory(exerciseId: string | null) {
  const [sets, setSets] = useState<SetData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!exerciseId) {
      setSets([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getSetsForExercise(exerciseId).then((data) => {
      if (!cancelled) {
        setSets(data as SetData[]);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [exerciseId]);

  const bestSet = sets.reduce<SetData | null>((best, set) => {
    if (!best || (set.calculated_1rm || 0) > (best.calculated_1rm || 0)) {
      return set;
    }
    return best;
  }, null);

  const recentSets = sets.slice(0, 10);

  return { sets, bestSet, recentSets, loading };
}
