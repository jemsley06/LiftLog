import React, { createContext, useContext, useEffect, useState } from "react";
import { seedDefaultExercises } from "../services/exercises";

interface DatabaseContextType {
  isReady: boolean;
}

const DatabaseContext = createContext<DatabaseContextType>({
  isReady: false,
});

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        await seedDefaultExercises();
      } catch (error) {
        console.warn("Database initialization error:", error);
      } finally {
        setIsReady(true);
      }
    }
    init();
  }, []);

  return (
    <DatabaseContext.Provider value={{ isReady }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export const useDatabase = () => useContext(DatabaseContext);
