import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Modal from "../ui/Modal";
import Badge from "../ui/Badge";
import { getAllExercises } from "../../services/exercises";

interface ExercisePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (exercise: { id: string; name: string; muscleGroup: string }) => void;
}

const MUSCLE_GROUPS = [
  "All",
  "Chest",
  "Back",
  "Shoulders",
  "Legs",
  "Arms",
  "Core",
];

export default function ExercisePicker({
  visible,
  onClose,
  onSelect,
}: ExercisePickerProps) {
  const [exercises, setExercises] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("All");

  useEffect(() => {
    if (!visible) return;
    loadExercises();
  }, [visible]);

  const loadExercises = async () => {
    const all = await getAllExercises();
    setExercises(all);
  };

  const filtered = exercises.filter((e) => {
    const matchesQuery =
      !query || e.name.toLowerCase().includes(query.toLowerCase());
    const matchesGroup =
      selectedGroup === "All" ||
      e.muscle_group.toLowerCase() === selectedGroup.toLowerCase();
    return matchesQuery && matchesGroup;
  });

  return (
    <Modal visible={visible} onClose={onClose} title="Select Exercise">
      <TextInput
        className="bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white text-base mb-3"
        placeholder="Search exercises..."
        placeholderTextColor="#64748B"
        value={query}
        onChangeText={setQuery}
      />

      {/* Muscle group filter chips */}
      <FlatList
        horizontal
        data={MUSCLE_GROUPS}
        showsHorizontalScrollIndicator={false}
        className="mb-3"
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedGroup(item)}
            className={`mr-2 px-3 py-1.5 rounded-full ${
              selectedGroup === item ? "bg-primary-600" : "bg-dark-800"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                selectedGroup === item ? "text-white" : "text-dark-300"
              }`}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item}
      />

      {/* Exercise list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        style={{ maxHeight: 400 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              onSelect({
                id: item.id,
                name: item.name,
                muscleGroup: item.muscle_group,
              });
              onClose();
            }}
            className="flex-row items-center justify-between py-3 border-b border-dark-800"
          >
            <View>
              <Text className="text-white text-base">{item.name}</Text>
              <Text className="text-dark-400 text-sm capitalize">
                {item.equipment}
              </Text>
            </View>
            <Badge
              label={item.muscle_group}
              variant="info"
              size="sm"
            />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text className="text-dark-400 text-center py-8">
            No exercises found
          </Text>
        }
      />
    </Modal>
  );
}
