import React from "react";
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  type ModalProps as RNModalProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ModalProps extends Omit<RNModalProps, "children"> {
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({
  title,
  onClose,
  children,
  visible,
  ...props
}: ModalProps) {
  return (
    <RNModal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      {...props}
    >
      <View className="flex-1 bg-black/60 justify-end">
        <View className="bg-dark-900 rounded-t-3xl max-h-[85%]">
          <View className="flex-row items-center justify-between px-5 pt-5 pb-3">
            {title && (
              <Text className="text-white text-xl font-bold">{title}</Text>
            )}
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 items-center justify-center rounded-full bg-dark-800"
            >
              <Ionicons name="close" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
          <View className="px-5 pb-8">{children}</View>
        </View>
      </View>
    </RNModal>
  );
}
