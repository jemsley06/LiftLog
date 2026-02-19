import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../providers/AuthProvider";
import { DatabaseProvider } from "../providers/DatabaseProvider";
import { WorkoutProvider } from "../providers/WorkoutProvider";
import "../global.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <DatabaseProvider>
        <WorkoutProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#0F172A" },
              animation: "fade",
            }}
          />
        </WorkoutProvider>
      </DatabaseProvider>
    </AuthProvider>
  );
}
