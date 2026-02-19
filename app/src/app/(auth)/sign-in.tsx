import React, { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Link, router } from "expo-router";
import { useAuth } from "../../providers/AuthProvider";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function SignIn() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSignIn = async () => {
    setErrors({});

    if (!email.trim()) {
      setErrors({ email: "Email is required" });
      return;
    }
    if (!password) {
      setErrors({ password: "Password is required" });
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace("/(tabs)/home");
    } catch (error: any) {
      Alert.alert("Sign In Failed", error.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        className="flex-1 bg-dark-900 px-6"
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo / Header */}
        <View className="items-center mb-10">
          <Text className="text-primary-400 text-5xl font-bold mb-2">
            LiftLog
          </Text>
          <Text className="text-dark-400 text-base">
            Track. Progress. Compete.
          </Text>
        </View>

        {/* Form */}
        <Input
          label="Email"
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
          error={errors.email}
        />

        <Input
          label="Password"
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          error={errors.password}
        />

        <Button
          title="Sign In"
          onPress={handleSignIn}
          loading={loading}
          className="mt-2"
        />

        <View className="flex-row items-center justify-center mt-6">
          <Text className="text-dark-400 text-sm">
            Don't have an account?{" "}
          </Text>
          <Link href="/(auth)/sign-up">
            <Text className="text-primary-400 text-sm font-semibold">
              Sign Up
            </Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
