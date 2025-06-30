import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  Keyboard,
  useColorScheme,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ThemedButton } from "@/components/ThemedButton";
import { register } from "@/api/user"

export default function CreatePassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isInvalidPassword, setIsInvalidPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const colorScheme = useColorScheme();
  const color = colorScheme === "dark" ? "white" : "black";
  const router = useRouter();

  const { name, username, email } = useLocalSearchParams();

  useEffect(() => {
    password.length < 8 || confirmPassword.length < 8
      ? setIsInvalidPassword(true)
      : setIsInvalidPassword(false);
  }, [password, confirmPassword]);

  const handleContinue = async () => {
    Keyboard.dismiss();

    if (password !== confirmPassword) {
      setIsError(true);
      setErrorMessage("Passwords do not match!");
      return;
    }

    // Api call
    setIsLoading(true);
    try {
      const data = await register(name, username, email, password);
      if (data.status) {
        router.push({
          pathname: "/(auth)/register-verify",
          params: { name, username, email, password },
        });
      }
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
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedView style={styles.container}>
          <ThemedText type="subtitle">Register a new account</ThemedText>
          <ThemedText style={styles.titleText}>Create password</ThemedText>

          <ThemedView style={styles.inputGroupContainer}>
            {/* Input container */}
            <ThemedView
              style={[
                styles.inputContainer,
                { borderColor: color },
                isError && { borderColor: "red" },
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={24}
                style={{ color }}
              />
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
                onChangeText={(text) => {
                  setIsError(false);
                  const sanitized = text.replace(
                    /[^A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g,
                    ""
                  );
                  setPassword(sanitized);
                }}
              />

              {/* Right show password icon */}
              <Ionicons
                style={{ color }}
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={24}
                onPress={() => setShowPassword(!showPassword)}
              />
            </ThemedView>
            <ThemedView
              style={[
                styles.inputContainer,
                { borderColor: color },
                isError && { borderColor: "red" },
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={24}
                style={{ color }}
              />
              <TextInput
                style={[styles.textInput, { color }]}
                placeholder="Confirm password"
                autoComplete="password-new"
                placeholderTextColor="gray"
                value={confirmPassword}
                autoCapitalize="none"
                secureTextEntry={!showConfirmPassword}
                autoCorrect={false}
                editable={!isLoading}
                onSubmitEditing={() => !isInvalidPassword && handleContinue()}
                onChangeText={(text) => {
                  setIsError(false);
                  const sanitized = text.replace(
                    /[^A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g,
                    ""
                  );
                  setConfirmPassword(sanitized);
                }}
              />

              {/* Right show password icon */}
              <Ionicons
                style={{ color }}
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                size={24}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            </ThemedView>
          </ThemedView>
          {isError && (
            <ThemedText style={{ color: "red" }}>{errorMessage}</ThemedText>
          )}
          <ThemedButton
            style={[
              styles.button,
              (isInvalidPassword || isLoading || isError) && { opacity: 0.5 }, // dim button when disabled
            ]}
            title={!isLoading && "Continue"}
            onPress={handleContinue}
            disabled={isInvalidPassword || isLoading || isError}
            isLoading={isLoading}
          />
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
  inputGroupContainer: {
    // marginVertical:10
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
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    width: "80%",
    paddingHorizontal: 10,
    marginVertical: 10,
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
});
