import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { calculate1RM } from "../../utils/calculations";

interface SetRowProps {
  setNumber: number;
  weight?: number;
  reps?: number;
  rpe?: number | null;
  calculated1RM?: number | null;
  strengthPct?: number | null;
  isPR?: boolean;
  isEditing?: boolean;
  previousWeight?: number;
  previousReps?: number;
  onSave?: (weight: number, reps: number, rpe?: number) => void;
  onDelete?: () => void;
}

export default function SetRow({
  setNumber,
  weight: initialWeight,
  reps: initialReps,
  rpe: initialRpe,
  calculated1RM,
  strengthPct,
  isPR = false,
  isEditing = false,
  previousWeight,
  previousReps,
  onSave,
  onDelete,
}: SetRowProps) {
  // Pre-fill with previous values when editing a new set
  const defaultWeight =
    initialWeight?.toString() || previousWeight?.toString() || "";
  const defaultReps =
    initialReps?.toString() || previousReps?.toString() || "";

  const [weight, setWeight] = useState(defaultWeight);
  const [reps, setReps] = useState(defaultReps);
  const [rpe, setRpe] = useState(initialRpe?.toString() || "");
  const repsRef = useRef<TextInput>(null);

  // Live 1RM preview while editing
  const w = parseFloat(weight);
  const r = parseInt(reps, 10);
  const live1RM = w > 0 && r > 0 ? calculate1RM(w, r) : null;

  const handleSave = () => {
    const parsedW = parseFloat(weight);
    const parsedR = parseInt(reps, 10);
    const parsedP = rpe ? parseFloat(rpe) : undefined;
    if (parsedW > 0 && parsedR > 0) {
      Keyboard.dismiss();
      onSave?.(parsedW, parsedR, parsedP);
    }
  };

  if (isEditing) {
    const weightPlaceholder = previousWeight ? `${previousWeight}` : "lbs";
    const repsPlaceholder = previousReps ? `${previousReps}` : "reps";

    return (
      <View className="bg-dark-800/50 rounded-xl mb-2 p-3">
        {/* Set number label */}
        <Text className="text-dark-500 text-xs font-semibold mb-2">
          SET {setNumber}
        </Text>

        {/* Input row */}
        <View className="flex-row items-center">
          <View className="flex-1 mr-2">
            <Text className="text-dark-500 text-xs mb-1">WEIGHT</Text>
            <TextInput
              className="bg-dark-700 rounded-xl px-4 py-3 text-white text-lg text-center font-semibold"
              placeholder={weightPlaceholder}
              placeholderTextColor="#475569"
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
              returnKeyType="next"
              selectTextOnFocus
              onSubmitEditing={() => repsRef.current?.focus()}
            />
          </View>

          <Text className="text-dark-500 text-lg font-bold mx-1">×</Text>

          <View className="flex-1 ml-2">
            <Text className="text-dark-500 text-xs mb-1">REPS</Text>
            <TextInput
              ref={repsRef}
              className="bg-dark-700 rounded-xl px-4 py-3 text-white text-lg text-center font-semibold"
              placeholder={repsPlaceholder}
              placeholderTextColor="#475569"
              keyboardType="numeric"
              value={reps}
              onChangeText={setReps}
              returnKeyType="done"
              selectTextOnFocus
              onSubmitEditing={handleSave}
            />
          </View>
        </View>

        {/* Live 1RM preview */}
        {live1RM !== null && live1RM > 0 && (
          <Text className="text-dark-400 text-xs text-center mt-2">
            Est. 1RM: {Math.round(live1RM)} lbs
          </Text>
        )}

        {/* Save button */}
        <TouchableOpacity
          onPress={handleSave}
          className="bg-primary-600 rounded-xl py-3 mt-3 flex-row items-center justify-center"
          activeOpacity={0.7}
        >
          <Ionicons name="checkmark" size={18} color="#FFFFFF" />
          <Text className="text-white font-semibold ml-2">Log Set</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Display mode
  return (
    <View className="flex-row items-center py-3 px-3 rounded-xl">
      {/* Set number */}
      <View className="w-7 h-7 rounded-full bg-dark-700 items-center justify-center">
        <Text className="text-dark-300 font-bold text-xs">{setNumber}</Text>
      </View>

      {/* Weight */}
      <View className="flex-1 items-center ml-3">
        <Text className="text-white text-base font-semibold">
          {initialWeight}
          <Text className="text-dark-500 text-sm font-normal"> lbs</Text>
        </Text>
      </View>

      <Text className="text-dark-600 mx-1">×</Text>

      {/* Reps */}
      <View className="flex-1 items-center">
        <Text className="text-white text-base font-semibold">
          {initialReps}
          <Text className="text-dark-500 text-sm font-normal"> reps</Text>
        </Text>
      </View>

      {/* 1RM + Strength % */}
      <View className="w-20 items-end">
        {calculated1RM ? (
          <Text className="text-dark-400 text-xs">
            {Math.round(calculated1RM)}
          </Text>
        ) : null}
        {strengthPct != null && strengthPct > 0 ? (
          <Text
            className={`text-xs font-semibold ${
              isPR
                ? "text-warning"
                : strengthPct >= 95
                ? "text-success"
                : strengthPct >= 80
                ? "text-primary-400"
                : "text-dark-500"
            }`}
          >
            {isPR ? "PR! " : ""}{Math.round(strengthPct)}%
          </Text>
        ) : null}
      </View>

      {/* Delete */}
      {onDelete && (
        <TouchableOpacity onPress={onDelete} className="ml-2 p-1">
          <Ionicons name="close-circle" size={18} color="#64748B" />
        </TouchableOpacity>
      )}
    </View>
  );
}
