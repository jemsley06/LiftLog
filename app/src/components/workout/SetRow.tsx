import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SetRowProps {
  setNumber: number;
  weight?: number;
  reps?: number;
  rpe?: number | null;
  calculated1RM?: number | null;
  isEditing?: boolean;
  onSave?: (weight: number, reps: number, rpe?: number) => void;
  onDelete?: () => void;
}

export default function SetRow({
  setNumber,
  weight: initialWeight,
  reps: initialReps,
  rpe: initialRpe,
  calculated1RM,
  isEditing = false,
  onSave,
  onDelete,
}: SetRowProps) {
  const [weight, setWeight] = useState(initialWeight?.toString() || "");
  const [reps, setReps] = useState(initialReps?.toString() || "");
  const [rpe, setRpe] = useState(initialRpe?.toString() || "");

  const handleSave = () => {
    const w = parseFloat(weight);
    const r = parseInt(reps, 10);
    const p = rpe ? parseFloat(rpe) : undefined;
    if (w > 0 && r > 0) {
      onSave?.(w, r, p);
    }
  };

  if (isEditing) {
    return (
      <View className="flex-row items-center py-2 px-3 bg-dark-800 rounded-xl mb-2">
        <Text className="text-dark-400 font-bold w-8 text-center">{setNumber}</Text>
        <TextInput
          className="flex-1 bg-dark-700 rounded-lg px-3 py-2 text-white text-center mx-1"
          placeholder="lbs"
          placeholderTextColor="#64748B"
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
        />
        <Text className="text-dark-500 mx-1">×</Text>
        <TextInput
          className="flex-1 bg-dark-700 rounded-lg px-3 py-2 text-white text-center mx-1"
          placeholder="reps"
          placeholderTextColor="#64748B"
          keyboardType="numeric"
          value={reps}
          onChangeText={setReps}
        />
        <TouchableOpacity
          onPress={handleSave}
          className="ml-2 bg-primary-600 rounded-lg px-3 py-2"
        >
          <Ionicons name="checkmark" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-row items-center py-2.5 px-3">
      <Text className="text-dark-400 font-bold w-8 text-center">{setNumber}</Text>
      <Text className="flex-1 text-white text-center">
        {initialWeight} lbs
      </Text>
      <Text className="text-dark-500 mx-1">×</Text>
      <Text className="flex-1 text-white text-center">{initialReps} reps</Text>
      {calculated1RM ? (
        <Text className="text-dark-400 text-sm w-20 text-right">
          1RM: {Math.round(calculated1RM)}
        </Text>
      ) : null}
      {onDelete && (
        <TouchableOpacity onPress={onDelete} className="ml-2">
          <Ionicons name="trash-outline" size={16} color="#EF4444" />
        </TouchableOpacity>
      )}
    </View>
  );
}
