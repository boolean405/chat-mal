import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import { forgotPassword, login } from "@/api/user";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/stores/authStore";

export default function LoginPassword() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const color = colorScheme === "dark" ? "white" : "black";

  const { setUser } = useAuthStore();

  const { email } = useLocalSearchParams();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isInvalidPassword, setIsInvalidPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    password.length < 8
      ? setIsInvalidPassword(true)
      : setIsInvalidPassword(false);
  }, [password]);

  const handleForgotPassword = async () => {
    // Api code here
    setLoading(true);
    try {
      const data = await forgotPassword(email);
      if (data.status) {
        router.push({
          pathname: "/(auth)/forgot-password-verify",
          params: { email },
        });
      }
    } catch (error: any) {
      setIsError(true);
      setErrorMessage(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    Keyboard.dismiss();

    // API code here
    setIsLoading(true);
    try {
      const data = await login(email, password);
      setUser(data.result.user, data.result.accessToken);
      router.replace("/(tab)");
    } catch (error: any) {
      setIsError(true);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.container}>
          <ThemedText type="subtitle">Login to your account</ThemedText>
          <ThemedText style={styles.titleText}>
            Enter your login password
          </ThemedText>

          {/* Input container */}
          <View
            style={[
              styles.inputContainer,
              { borderColor: color },
              isError && { borderColor: "red" },
            ]}
          >
            <Ionicons name="lock-closed-outline" size={24} style={{ color }} />
            <TextInput
              style={[styles.textInput, { color }]}
              placeholder="Password"
              autoComplete="password-new"
              placeholderTextColor="gray"
              value={password}
              autoCapitalize="none"
              secureTextEntry={!showPassword}
              autoCorrect={false}
              editable={!isLoading}
              onSubmitEditing={() =>
                !isInvalidPassword && !isError && handleLogin()
              }
              onChangeText={(text) => {
                setIsError(false);
                const sanitized = text.replace(/\s/g, "");
                setPassword(sanitized);
              }}
            />

            {/* Right show password icon */}
            <Ionicons
              style={{ color }}
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={24}
              onPress={() => !isLoading && setShowPassword(!showPassword)}
            />
          </View>
          {isError && (
            <ThemedText style={{ color: "red" }}>{errorMessage}</ThemedText>
          )}
          <ThemedButton
            style={[
              styles.button,
              (isInvalidPassword || isLoading || isError) && { opacity: 0.5 }, // dim button when disabled
            ]}
            title={!isLoading && "Login"}
            onPress={handleLogin}
            disabled={isInvalidPassword || isLoading || isError}
            isLoading={isLoading}
          />
          <ThemedView style={styles.forgotPasswordContainer}>
            <TouchableOpacity
              disabled={isLoading || loading}
              onPress={handleForgotPassword}
            >
              <ThemedText type="defaultItalic">
                {loading ? "Processing..." : "Forgot password?"}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoImage: {
    width: 150,
    height: 150,
  },
  titleText: {
    marginTop: 60,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    width: "80%",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 10,
    height: 50,
  },
  button: {
    width: "80%",
    marginTop: 10,
  },
  forgotPasswordContainer: {
    width: "80%",
    marginTop: 10,
    alignItems: "flex-end",
    paddingRight: 20,
  },
});
