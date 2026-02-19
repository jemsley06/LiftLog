import React from "react";
import { View, Text } from "react-native";

interface BadgeProps {
  label: string;
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
}

export default function Badge({
  label,
  variant = "default",
  size = "sm",
}: BadgeProps) {
  const variantClasses = {
    default: "bg-dark-700",
    success: "bg-success/20",
    warning: "bg-warning/20",
    error: "bg-error/20",
    info: "bg-primary-600/20",
  };

  const textColorClasses = {
    default: "text-dark-300",
    success: "text-success",
    warning: "text-warning",
    error: "text-error",
    info: "text-primary-400",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5",
    md: "px-3 py-1",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
  };

  return (
    <View className={`rounded-full ${variantClasses[variant]} ${sizeClasses[size]}`}>
      <Text
        className={`font-semibold ${textColorClasses[variant]} ${textSizeClasses[size]}`}
      >
        {label}
      </Text>
    </View>
  );
}
