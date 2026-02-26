import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import ExercisePicker from "./ExercisePicker";

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
}

interface TemplateEditorProps {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string, exerciseIds: string[]) => void;
  initialName?: string;
  initialExercises?: Exercise[];
}

export default function TemplateEditor({
  visible,
  onClose,
  onSave,
  initialName = "",
  initialExercises = [],
}: TemplateEditorProps) {
  const [name, setName] = useState(initialName);
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [showPicker, setShowPicker] = useState(false);

  const handleAddExercise = (exercise: Exercise) => {
    if (exercises.find((e) => e.id === exercise.id)) return;
    setExercises((prev) => [...prev, exercise]);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setExercises((prev) => prev.filter((e) => e.id !== exerciseId));
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a template name");
      return;
    }
    if (exercises.length === 0) {
      Alert.alert("Error", "Add at least one exercise");
      return;
    }
    onSave(name.trim(), exercises.map((e) => e.id));
    setName("");
    setExercises([]);
    onClose();
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Create Template">
      <Input
        label="Template Name"
        placeholder="e.g., Push Day, Leg Day"
        value={name}
        onChangeText={setName}
      />

      <Text className="text-dark-300 text-sm font-medium mb-2">
        Exercises ({exercises.length})
      </Text>

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item, index }) => (
          <View className="flex-row items-center justify-between py-2 px-3 bg-dark-800 rounded-xl mb-2">
            <View className="flex-row items-center">
              <Text className="text-dark-400 font-bold mr-3">{index + 1}</Text>
              <View>
                <Text className="text-white text-base">{item.name}</Text>
                <Text className="text-dark-400 text-xs capitalize">
                  {item.muscleGroup}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => handleRemoveExercise(item.id)}>
              <Ionicons name="close-circle" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        className="flex-row items-center justify-center py-3 border border-dashed border-dark-600 rounded-xl mb-4"
      >
        <Ionicons name="add" size={18} color="#818CF8" />
        <Text className="text-primary-400 font-semibold ml-1">
          Add Exercise
        </Text>
      </TouchableOpacity>

      <Button title="Save Template" onPress={handleSave} />

      <ExercisePicker
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleAddExercise}
      />
    </Modal>
  );
}
