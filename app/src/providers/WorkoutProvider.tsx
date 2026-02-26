import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  createWorkout,
  completeWorkout,
  logSet,
  updateSet,
  deleteSet,
  getActiveWorkout,
} from "../services/workouts";
import { useAuth } from "./AuthProvider";

interface ActiveWorkout {
  id: string;
  name: string | null;
  startedAt: number;
}

interface WorkoutContextType {
  activeWorkout: ActiveWorkout | null;
  isWorkoutActive: boolean;
  startWorkout: (name?: string) => Promise<void>;
  finishWorkout: (notes?: string) => Promise<void>;
  cancelWorkout: () => void;
  addSet: (
    exerciseId: string,
    setNumber: number,
    weight: number,
    reps: number,
    rpe?: number
  ) => Promise<any>;
  editSet: (
    setId: string,
    weight: number,
    reps: number,
    rpe?: number
  ) => Promise<void>;
  removeSet: (setId: string) => Promise<void>;
}

const WorkoutContext = createContext<WorkoutContextType>({
  activeWorkout: null,
  isWorkoutActive: false,
  startWorkout: async () => {},
  finishWorkout: async () => {},
  cancelWorkout: () => {},
  addSet: async () => null,
  editSet: async () => {},
  removeSet: async () => {},
});

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(null);

  // Restore active workout on mount / user change
  useEffect(() => {
    if (!user) {
      setActiveWorkout(null);
      return;
    }
    getActiveWorkout(user.id).then((workout) => {
      if (workout) {
        setActiveWorkout({
          id: workout.id,
          name: workout.name,
          startedAt: workout.started_at,
        });
      }
    });
  }, [user?.id]);

  const startWorkout = useCallback(
    async (name?: string) => {
      if (!user) return;
      const workout = await createWorkout(user.id, name);
      setActiveWorkout({
        id: workout.id,
        name: workout.name,
        startedAt: workout.started_at,
      });
    },
    [user]
  );

  const finishWorkout = useCallback(
    async (notes?: string) => {
      if (!activeWorkout) return;
      const result = await completeWorkout(activeWorkout.id, notes);
      if (result) {
        setActiveWorkout(null);
      }
    },
    [activeWorkout]
  );

  const cancelWorkout = useCallback(() => {
    setActiveWorkout(null);
  }, []);

  const addSet = useCallback(
    async (
      exerciseId: string,
      setNumber: number,
      weight: number,
      reps: number,
      rpe?: number
    ) => {
      if (!activeWorkout) return null;
      return logSet(activeWorkout.id, exerciseId, setNumber, weight, reps, rpe);
    },
    [activeWorkout]
  );

  const editSet = useCallback(
    async (setId: string, weight: number, reps: number, rpe?: number) => {
      await updateSet(setId, weight, reps, rpe);
    },
    []
  );

  const removeSet = useCallback(async (setId: string) => {
    await deleteSet(setId);
  }, []);

  return (
    <WorkoutContext.Provider
      value={{
        activeWorkout,
        isWorkoutActive: activeWorkout !== null,
        startWorkout,
        finishWorkout,
        cancelWorkout,
        addSet,
        editSet,
        removeSet,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export const useWorkoutContext = () => useContext(WorkoutContext);
