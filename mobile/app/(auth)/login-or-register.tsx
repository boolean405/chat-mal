import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";

import {
  GoogleSignin,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";

import { LoginManager, AccessToken } from "react-native-fbsdk-next";

import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  useColorScheme,
} from "react-native";

import { existEmail, loginFacebook, loginGoogle } from "@/api/user";
import { Ionicons } from "@expo/vector-icons";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { APP_NAME, APP_TAGLINE } from "@/constants";
import { useAuthStore } from "@/stores/authStore";

export default function LoginOrRegister() {
  const colorScheme = useColorScheme();
  const color = colorScheme === "dark" ? "white" : "black";
  const { setUser } = useAuthStore();

  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInvalidEmail, setIsInvalidEmail] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isGoogleLoginLoading, setIsGoogleLoginLoading] = useState(false);
  const [isFacebookLoginLoading, setIsFacebookLoginLoading] = useState(false);

  useEffect(() => {
    const validateEmail = (email: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    if (validateEmail(email)) setIsInvalidEmail(false);
    else setIsInvalidEmail(true);
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

  // Handle google login
  const handleGoogleLogin = async () => {
    Keyboard.dismiss();
    setIsGoogleLoginLoading(true);

    try {
      await GoogleSignin.hasPlayServices();
      // Force account picker by signing out first
      await GoogleSignin.signOut();
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        const data = await loginGoogle(response.data.user);

        console.log(JSON.stringify(data.result, null, 2));
        setUser(data.result.user, data.result.accessToken);
        router.replace("/(tab)");
      } else {
        Alert.alert(
          "Failed to login with Google",
          "Something went wrong. Please try again later."
        );
      }
    } catch (error: any) {
      console.log(error.message);

      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            break;
          case statusCodes.IN_PROGRESS:
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            break;
          default:
            break;
        }
      }
    } finally {
      setIsGoogleLoginLoading(false);
    }
  };

  // Facebook login
  const handleFacebookLogin = async () => {
    Keyboard.dismiss();
    setIsFacebookLoginLoading(true);

    try {
      const result = await LoginManager.logInWithPermissions([
        "public_profile",
        "email",
      ]);

      console.log(result, "result");

      if (result.isCancelled) {
        console.log("Login cancelled");
        return;
      }

      // Get the access token
      const data = await AccessToken.getCurrentAccessToken();

      if (!data) {
        console.log("Failed to get access token");
        return;
      }

      const { accessToken } = data;

      // Send the token to your backend
      // const response = await loginFacebook(accessToken);

      // console.log("Backend response:");
    } catch (error: any) {
      console.log(error.message);
    } finally {
      setIsFacebookLoginLoading(false);
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
          <ThemedText type="small" style={{ fontWeight: "200" }}>
            OR
          </ThemedText>

          <ThemedView style={styles.authLoginContainer}>
            <ThemedButton
              style={[styles.authButton]}
              title={
                !isGoogleLoginLoading && (
                  <Ionicons name="logo-google" size={22} />
                )
              }
              disabled={isGoogleLoginLoading || isFacebookLoginLoading}
              onPress={handleGoogleLogin}
              isLoading={isGoogleLoginLoading}
            />
            <ThemedButton
              style={[styles.authButton]}
              title={
                !isFacebookLoginLoading && (
                  <Ionicons name="logo-facebook" size={22} />
                )
              }
              disabled={isFacebookLoginLoading || isGoogleLoginLoading}
              onPress={handleFacebookLogin}
              isLoading={isFacebookLoginLoading}
            />
          </ThemedView>
          <ThemedText style={{ fontWeight: "200", marginTop: 10 }}>
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
  authButton: {
    width: "48%",
    justifyContent: "center",
    alignItems: "center",
  },
  authLoginContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%", // was 50%
    alignItems: "center",
    marginVertical: 10,
  },
});
