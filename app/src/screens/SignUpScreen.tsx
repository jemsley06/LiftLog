import React, { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../providers/AuthProvider";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { validateSignUp } from "../utils/validation";

export default function SignUpScreen() {
  const navigation = useNavigation<any>();
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSignUp = async () => {
    const validationErrors = validateSignUp(email.trim(), password, username.trim());
    if (validationErrors.length > 0) {
      const errMap: Record<string, string> = {};
      validationErrors.forEach((e) => (errMap[e.field] = e.message));
      setErrors(errMap);
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      await signUp(email.trim(), password, username.trim());
      Alert.alert(
        "Account Created",
        "Check your email to verify your account, then sign in.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert("Sign Up Failed", error.message || "Please try again.");
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
        <View className="items-center mb-10">
          <Text className="text-primary-400 text-5xl font-bold mb-2">
            LiftLog
          </Text>
          <Text className="text-dark-400 text-base">
            Create your account
          </Text>
        </View>

        <Input
          label="Username"
          placeholder="Choose a username"
          autoCapitalize="none"
          autoCorrect={false}
          value={username}
          onChangeText={setUsername}
          error={errors.username}
        />

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
          placeholder="At least 6 characters"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          error={errors.password}
        />

        <Button
          title="Create Account"
          onPress={handleSignUp}
          loading={loading}
          className="mt-2"
        />

        <View className="flex-row items-center justify-center mt-6">
          <Text className="text-dark-400 text-sm">
            Already have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-primary-400 text-sm font-semibold">
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
