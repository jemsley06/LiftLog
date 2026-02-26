import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Modal from "../ui/Modal";

interface Template {
  id: string;
  name: string;
  exercise_ids: string[];
}

interface TemplatePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (template: Template) => void;
  onManage: () => void;
  templates: Template[];
}

export default function TemplatePicker({
  visible,
  onClose,
  onSelect,
  onManage,
  templates,
}: TemplatePickerProps) {
  return (
    <Modal visible={visible} onClose={onClose} title="Start from Template">
      <FlatList
        data={templates}
        keyExtractor={(item) => item.id}
        style={{ maxHeight: 400 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              onSelect(item);
              onClose();
            }}
            className="flex-row items-center justify-between py-4 border-b border-dark-800"
          >
            <View>
              <Text className="text-white text-base font-semibold">
                {item.name}
              </Text>
              <Text className="text-dark-400 text-sm">
                {item.exercise_ids.length} exercises
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#64748B" />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="items-center py-8">
            <Ionicons name="document-outline" size={36} color="#334155" />
            <Text className="text-dark-400 text-base mt-3">
              No templates yet
            </Text>
            <Text className="text-dark-500 text-sm mt-1">
              Create one to quickly start workouts
            </Text>
          </View>
        }
      />
      <TouchableOpacity
        onPress={() => {
          onManage();
          onClose();
        }}
        className="flex-row items-center justify-center py-3 mt-3 border-t border-dark-800"
      >
        <Ionicons name="settings-outline" size={16} color="#818CF8" />
        <Text className="text-primary-400 font-semibold ml-2">
          Manage Templates
        </Text>
      </TouchableOpacity>
    </Modal>
  );
}
