import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

export default function Button({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const baseClasses = "flex-row items-center justify-center rounded-xl";

  const sizeClasses = {
    sm: "px-3 py-2",
    md: "px-5 py-3",
    lg: "px-6 py-4",
  };

  const variantClasses = {
    primary: "bg-primary-600",
    secondary: "bg-dark-700",
    outline: "border-2 border-primary-600 bg-transparent",
    ghost: "bg-transparent",
    danger: "bg-error",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const textColorClasses = {
    primary: "text-white",
    secondary: "text-dark-100",
    outline: "text-primary-400",
    ghost: "text-primary-400",
    danger: "text-white",
  };

  const disabledClasses = disabled || loading ? "opacity-50" : "";

  return (
    <TouchableOpacity
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses} ${className || ""}`}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" || variant === "ghost" ? "#818CF8" : "#FFFFFF"}
          size="small"
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            className={`font-semibold ${textSizeClasses[size]} ${textColorClasses[variant]} ${icon ? "ml-2" : ""}`}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
