import React from "react";
import { TouchableOpacity, type TouchableOpacityProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface IconButtonProps extends TouchableOpacityProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  variant?: "default" | "filled";
}

export default function IconButton({
  name,
  size = 22,
  color = "#94A3B8",
  variant = "default",
  className,
  ...props
}: IconButtonProps) {
  const variantClasses = {
    default: "",
    filled: "bg-dark-800 rounded-full p-2",
  };

  return (
    <TouchableOpacity
      className={`items-center justify-center ${variantClasses[variant]} ${className || ""}`}
      activeOpacity={0.7}
      {...props}
    >
      <Ionicons name={name} size={size} color={color} />
    </TouchableOpacity>
  );
}
