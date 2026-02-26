import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./providers/AuthProvider";
import { DatabaseProvider } from "./providers/DatabaseProvider";
import { WorkoutProvider } from "./providers/WorkoutProvider";
import { RootNavigator } from "./navigation";
import "./global.css";

export default function App() {
  return (
    <AuthProvider>
      <DatabaseProvider>
        <WorkoutProvider>
          <NavigationContainer
            theme={{
              dark: true,
              colors: {
                primary: "#6366F1",
                background: "#0F172A",
                card: "#0F172A",
                text: "#FFFFFF",
                border: "#1E293B",
                notification: "#6366F1",
              },
              fonts: {
                regular: { fontFamily: "System", fontWeight: "400" },
                medium: { fontFamily: "System", fontWeight: "500" },
                bold: { fontFamily: "System", fontWeight: "700" },
                heavy: { fontFamily: "System", fontWeight: "900" },
              },
            }}
          >
            <StatusBar style="light" />
            <RootNavigator />
          </NavigationContainer>
        </WorkoutProvider>
      </DatabaseProvider>
    </AuthProvider>
  );
}
