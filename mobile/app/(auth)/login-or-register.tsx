import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  useColorScheme,
} from "react-native";

import { existEmail } from "@/api/user";
import { Ionicons } from "@expo/vector-icons";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { APP_NAME, APP_TAGLINE } from "@/constants";

export default function LoginOrRegister() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInvalidEmail, setIsInvalidEmail] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const colorScheme = useColorScheme();
  const color = colorScheme === "dark" ? "white" : "black";

  const router = useRouter();

  useEffect(() => {
    const validateEmail = (email: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    validateEmail(email) ? setIsInvalidEmail(false) : setIsInvalidEmail(true);
  }, [email]);

  const handleContinue = async () => {
    Keyboard.dismiss();

    // api call
    setIsLoading(true);
    try {
      const data = await existEmail(email);
      if (data.status) {
        router.push({
          pathname: "/(auth)/login-password",
          params: { email },
        });
      } else {
        router.push({
          pathname: "/(auth)/create-name",
          params: { email },
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
          <Image
            style={styles.logoImage}
            source={require("@/assets/images/logo.png")}
          />
          <ThemedText type="title">{APP_NAME}</ThemedText>
          <ThemedText type="subtitle">{APP_TAGLINE}</ThemedText>
          <ThemedText style={styles.titleText}>
            Enter your email address to login or register
          </ThemedText>

          {/* Input container */}
          <ThemedView style={[styles.inputContainer, { borderColor: color }]}>
            <Ionicons name="mail-outline" size={24} style={[{ color }]} />
            <TextInput
              style={[styles.textInput, { color }]}
              placeholder="Email"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              placeholderTextColor="gray"
              value={email}
              autoCapitalize="none"
              editable={!isLoading}
              onSubmitEditing={() =>
                !isInvalidEmail && email.trim() && handleContinue()
              }
              onChangeText={(text) => {
                setIsError(false);
                const sanitized = text
                  .replace(/[^a-zA-Z0-9@._-]/g, "")
                  .toLowerCase();
                setEmail(sanitized);
              }}
            />
          </ThemedView>

          {isError && (
            <ThemedText style={{ color: "red" }}>{errorMessage}</ThemedText>
          )}

          <ThemedButton
            style={[
              styles.button,
              (isInvalidEmail || isLoading || isError) && { opacity: 0.5 }, // dim button when disabled
            ]}
            title={!isLoading && "Continue"}
            disabled={isInvalidEmail || isLoading || isError}
            onPress={handleContinue}
            isLoading={isLoading}
          />
          <ThemedText style={{ fontWeight: "200" }}>
            By clicking continue, you agree to our
          </ThemedText>
          <ThemedText style={{ fontWeight: "400" }}>
            Terms of Service and Privacy Policy
          </ThemedText>
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
    marginVertical: 10,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 10,
    height: 50,
  },
  button: {
    width: "80%",
    marginVertical: 10,
  },
});
