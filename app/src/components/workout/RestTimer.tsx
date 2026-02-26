import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatRestTime } from "../../utils/formatting";

export interface RestTimerHandle {
  triggerStart: () => void;
}

interface RestTimerProps {
  defaultSeconds?: number;
}

const PRESETS = [60, 90, 120, 180];

const RestTimer = forwardRef<RestTimerHandle, RestTimerProps>(
  ({ defaultSeconds = 90 }, ref) => {
    const [duration, setDuration] = useState(defaultSeconds);
    const [seconds, setSeconds] = useState(defaultSeconds);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useImperativeHandle(ref, () => ({
      triggerStart: () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setSeconds(duration);
        setIsRunning(true);
      },
    }));

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
      setSeconds(duration);
      setIsRunning(true);
    };

    const stop = () => {
      setIsRunning(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    const reset = () => {
      stop();
      setSeconds(duration);
    };

    const selectPreset = (preset: number) => {
      setDuration(preset);
      if (!isRunning) {
        setSeconds(preset);
      }
    };

    const formatPreset = (s: number) => {
      return s >= 60 ? `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}` : `${s}s`;
    };

    return (
      <View className="bg-dark-800 rounded-xl py-3 px-4">
        {/* Timer display */}
        <View className="flex-row items-center justify-center">
          <TouchableOpacity onPress={isRunning ? stop : start} className="mr-3">
            <Ionicons
              name={isRunning ? "pause-circle" : "play-circle"}
              size={32}
              color={seconds === 0 ? "#22C55E" : "#818CF8"}
            />
          </TouchableOpacity>

          <Text
            className={`text-2xl font-bold ${
              seconds === 0
                ? "text-success"
                : seconds <= 10
                ? "text-warning"
                : "text-white"
            }`}
          >
            {formatRestTime(seconds)}
          </Text>

          <TouchableOpacity onPress={reset} className="ml-3">
            <Ionicons name="refresh-circle-outline" size={28} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Duration presets */}
        <View className="flex-row items-center justify-center mt-2 gap-2">
          {PRESETS.map((preset) => (
            <TouchableOpacity
              key={preset}
              onPress={() => selectPreset(preset)}
              className={`px-3 py-1 rounded-full ${
                duration === preset ? "bg-primary-600/30" : "bg-dark-700"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  duration === preset ? "text-primary-400" : "text-dark-400"
                }`}
              >
                {formatPreset(preset)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }
);

export default RestTimer;
