import React, { createContext, useContext, useEffect, useState } from "react";
import { database } from "../db";
import { seedDefaultExercises } from "../services/exercises";
import type { Database } from "@nozbe/watermelondb";

interface DatabaseContextType {
  database: Database;
  isReady: boolean;
}

const DatabaseContext = createContext<DatabaseContextType>({
  database,
  isReady: false,
});

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        await seedDefaultExercises();
        setIsReady(true);
      } catch (error) {
        console.error("Database initialization error:", error);
        setIsReady(true); // Continue even if seeding fails
      }
    }
    init();
  }, []);

  return (
    <DatabaseContext.Provider value={{ database, isReady }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export const useDatabase = () => useContext(DatabaseContext);
