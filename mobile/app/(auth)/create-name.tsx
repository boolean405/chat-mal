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
import { existUsername } from "@/api/user"

export default function CreateName() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [isInvalidName, setIsInvalidName] = useState(false);
  const [isInvalidUsername, setIsInvalidUsername] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const colorScheme = useColorScheme();
  const color = colorScheme === "dark" ? "white" : "black";
  const router = useRouter();

  const { email } = useLocalSearchParams();

  useEffect(() => {
    const validName = (str: string) => /^[A-Za-z ]{1,20}$/.test(str);
    const validUsername = (str: string) => /^[a-z0-9]{5,20}$/.test(str);

    validName(name) ? setIsInvalidName(false) : setIsInvalidName(true);

    validUsername(username)
      ? setIsInvalidUsername(false)
      : setIsInvalidUsername(true);
  }, [name, username]);

  const handleContinue = async () => {
    Keyboard.dismiss();
    setIsLoading(true);

    try {
      const data = await existUsername(username);
      if (data.status) {
        setIsError(true);
        setErrorMessage("Username already exists!");
        return;
      }

      router.push({
        pathname: "/(auth)/create-password",
        params: { name, username, email },
      });
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
          <ThemedText style={styles.titleText}>Create name</ThemedText>

          <ThemedView style={styles.inputGroupContainer}>
            {/* Input container */}
            <ThemedView style={[styles.inputContainer, { borderColor: color }]}>
              <Ionicons name="person-outline" size={24} style={{ color }} />
              <TextInput
                style={[styles.textInput, { color }]}
                placeholder="Name"
                autoComplete="name"
                placeholderTextColor="gray"
                value={name}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!isLoading}
                onBlur={() => setName(name.trim())}
                onChangeText={(text) => {
                  setIsError(false);
                  const sanitized = text
                    .replace(/^\s+/, "") // Remove leading spaces
                    .replace(/[^A-Za-z\s]/g, "") // Remove all non-letter characters
                  setName(sanitized);
                }}
              />
            </ThemedView>
            <ThemedView
              style={[
                styles.inputContainer,
                { borderColor: color },
                isError && { borderColor: "red" },
              ]}
            >
              <Ionicons name="at-outline" size={24} style={{ color }} />
              <TextInput
                style={[styles.textInput, { color }]}
                placeholder="Username"
                autoComplete="username-new"
                placeholderTextColor="gray"
                value={username}
                autoCapitalize="none"
                // keyboardType="name-phone-pad"
                autoCorrect={false}
                editable={!isLoading}
                onSubmitEditing={() =>
                  !isInvalidName &&
                  !isInvalidUsername &&
                  !isError &&
                  handleContinue()
                }
                onChangeText={(text) => {
                  setIsError(false);
                  const sanitized = text
                    .replace(/[^a-z0-9]/g, "")
                    .toLowerCase();
                  setUsername(sanitized);
                }}
              />
            </ThemedView>
          </ThemedView>
          {isError && (
            <ThemedText style={{ color: "red" }}>{errorMessage}</ThemedText>
          )}
          <ThemedButton
            style={[
              styles.button,
              (isInvalidUsername || isInvalidName || isLoading || isError) && {
                opacity: 0.5,
              }, // dim button when disabled
            ]}
            title={!isLoading && "Continue"}
            onPress={handleContinue}
            disabled={
              isInvalidUsername || isInvalidName || isLoading || isError
            }
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
