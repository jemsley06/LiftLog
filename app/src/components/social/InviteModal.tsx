import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";

interface Friend {
  id: string;
  username: string;
}

interface InviteModalProps {
  visible: boolean;
  onClose: () => void;
  friends: Friend[];
  onInvite: (friendIds: string[]) => void;
  partyName?: string;
}

export default function InviteModal({
  visible,
  onClose,
  friends,
  onInvite,
  partyName,
}: InviteModalProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleFriend = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleInvite = () => {
    onInvite(Array.from(selected));
    setSelected(new Set());
    onClose();
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={`Invite to ${partyName || "Party"}`}
    >
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        style={{ maxHeight: 300 }}
        renderItem={({ item }) => {
          const isSelected = selected.has(item.id);
          return (
            <TouchableOpacity
              onPress={() => toggleFriend(item.id)}
              className={`flex-row items-center py-3 px-3 mb-1 rounded-xl ${
                isSelected ? "bg-primary-600/20" : "bg-dark-800"
              }`}
            >
              <View className="w-8 h-8 rounded-full bg-dark-700 items-center justify-center">
                <Text className="text-dark-200 font-bold text-sm">
                  {item.username.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text className="flex-1 text-white font-medium ml-3">
                {item.username}
              </Text>
              <Ionicons
                name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                size={22}
                color={isSelected ? "#6366F1" : "#475569"}
              />
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text className="text-dark-400 text-center py-8">
            No friends to invite. Add friends first!
          </Text>
        }
      />

      <Button
        title={`Invite ${selected.size > 0 ? `(${selected.size})` : ""}`}
        onPress={handleInvite}
        disabled={selected.size === 0}
        className="mt-4"
      />
    </Modal>
  );
}
