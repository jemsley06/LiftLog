import React, { forwardRef } from "react";
import { View, TextInput, Text, type TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, containerClassName, className, ...props }, ref) => {
    return (
      <View className={`mb-4 ${containerClassName || ""}`}>
        {label && (
          <Text className="text-dark-300 text-sm font-medium mb-1.5">
            {label}
          </Text>
        )}
        <TextInput
          ref={ref}
          className={`bg-dark-800 border ${error ? "border-error" : "border-dark-700"} rounded-xl px-4 py-3 text-white text-base ${className || ""}`}
          placeholderTextColor="#64748B"
          {...props}
        />
        {error && (
          <Text className="text-error text-xs mt-1">{error}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = "Input";

export default Input;
