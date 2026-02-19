import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatRestTime } from "../../utils/formatting";

interface RestTimerProps {
  defaultSeconds?: number;
}

export default function RestTimer({ defaultSeconds = 90 }: RestTimerProps) {
  const [seconds, setSeconds] = useState(defaultSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, seconds]);

  const start = () => {
    setSeconds(defaultSeconds);
    setIsRunning(true);
  };

  const stop = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const reset = () => {
    stop();
    setSeconds(defaultSeconds);
  };

  const progress = seconds / defaultSeconds;

  return (
    <View className="flex-row items-center justify-center py-3 bg-dark-800 rounded-xl">
      <TouchableOpacity onPress={isRunning ? stop : start} className="mr-3">
        <Ionicons
          name={isRunning ? "pause-circle" : "play-circle"}
          size={32}
          color={seconds === 0 ? "#22C55E" : "#818CF8"}
        />
      </TouchableOpacity>

      <Text
        className={`text-2xl font-bold ${
          seconds === 0 ? "text-success" : seconds <= 10 ? "text-warning" : "text-white"
        }`}
      >
        {formatRestTime(seconds)}
      </Text>

      <TouchableOpacity onPress={reset} className="ml-3">
        <Ionicons name="refresh-circle-outline" size={28} color="#64748B" />
      </TouchableOpacity>
    </View>
  );
}
