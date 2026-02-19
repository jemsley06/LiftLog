import React from "react";
import { View, type ViewProps } from "react-native";

interface CardProps extends ViewProps {
  variant?: "default" | "elevated";
  padding?: "none" | "sm" | "md" | "lg";
}

export default function Card({
  variant = "default",
  padding = "md",
  className,
  children,
  ...props
}: CardProps) {
  const variantClasses = {
    default: "bg-dark-800 border border-dark-700",
    elevated: "bg-dark-800 shadow-lg shadow-black/30",
  };

  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <View
      className={`rounded-2xl ${variantClasses[variant]} ${paddingClasses[padding]} ${className || ""}`}
      {...props}
    >
      {children}
    </View>
  );
}
