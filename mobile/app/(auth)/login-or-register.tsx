import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";

import {
  GoogleSignin,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";

import {
  LoginManager,
  AccessToken,
  GraphRequestManager,
  GraphRequest,
} from "react-native-fbsdk-next";

import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import { existEmail, loginGoogle } from "@/api/user";
import { Ionicons } from "@expo/vector-icons";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { APP_NAME, APP_TAGLINE } from "@/constants";
import { useAuthStore } from "@/stores/authStore";
import { Colors } from "@/constants/colors";

export default function LoginOrRegister() {
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];
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

        setUser(data.result.user, data.result.accessToken);
        router.replace("/(tab)");
      } else {
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

  // Facebook login , now unavaliable
  const handleFacebookLogin = async () => {
    Keyboard.dismiss();
    setIsFacebookLoginLoading(true);

    try {
      const result = await LoginManager.logInWithPermissions([
        "public_profile",
        "email",
      ]);

      if (result.isCancelled) {
        return console.log("Login cancelled");
      }

      const data = await AccessToken.getCurrentAccessToken();

      if (data) {
        const infoRequest = new GraphRequest(
          "/me",
          {
            accessToken: data.accessToken,
            parameters: {
              fields: {
                string: "id,name,email,picture.type(large)",
              },
            },
          },
          (error, result) => {
            if (error) {
              console.log("Error fetching data: " + error.toString());
            } else if (result) {
              // const data = loginFacebook();

              console.log(
                "Success fetching data: ",
                JSON.stringify(result, null, 2)
              );
              console.log("email", result.email);
              console.log(
                "Granted permissions:",
                result.grantedPermissions?.toString()
              );
            }
          }
        );

        new GraphRequestManager().addRequest(infoRequest).start();
      }
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
          {/* <ThemedText type="subtitle">{APP_TAGLINE}</ThemedText> */}
          <ThemedText type="large" style={styles.titleText}>
            Enter your email address
          </ThemedText>

          {/* Input container */}
          <ThemedView
            style={[
              styles.inputContainer,
              { borderColor: color.secondaryBorder },
            ]}
          >
            <Ionicons
              name="mail-outline"
              size={24}
              style={[{ color: color.primaryIcon }]}
            />
            <TextInput
              style={[styles.textInput, { color: color.primaryText }]}
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
            title={"Continue"}
            disabled={isInvalidEmail || isLoading || isError}
            onPress={handleContinue}
            isLoading={isLoading}
          />
          <ThemedText type="small" style={{ fontWeight: "condensedBold" }}>
            OR
          </ThemedText>

          {/* Google button */}
          <ThemedView style={styles.authLoginContainer}>
            <ThemedButton
              style={[styles.authButton]}
              title={
                <View style={styles.authButtonContainer}>
                  <Ionicons
                    color={color.primaryBackground}
                    name="logo-google"
                    size={22}
                  />
                  <Text
                    style={[
                      styles.authButtonText,
                      { color: color.primaryBackground },
                    ]}
                  >
                    Continue with Google
                  </Text>
                </View>
              }
              disabled={isGoogleLoginLoading || isFacebookLoginLoading}
              onPress={handleGoogleLogin}
              isLoading={isGoogleLoginLoading}
            />

            {/* Facebook button */}
            {/* <ThemedButton
              style={[styles.authButton]}
              title={
                <View style={styles.authButtonContainer}>
                  <Ionicons
                    color={color.primaryBackground}
                    name="logo-facebook"
                    size={22}
                  />
                  <Text
                    style={[styles.authButtonText, { color: color.primaryBackground }]}
                  >
                    Continue with Facebook
                  </Text>
                </View>
              }
              disabled={isGoogleLoginLoading || isFacebookLoginLoading}
              onPress={handleFacebookLogin}
              isLoading={isFacebookLoginLoading}
            /> */}
          </ThemedView>
          <ThemedText style={{ fontWeight: "200", marginTop: 10 }}>
            By clicking continue, you agree to our
          </ThemedText>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              onPress={() => router.push("/(menu)/terms-of-service")}
            >
              <ThemedText type="link" style={{ fontWeight: "400" }}>
                Terms of Service
              </ThemedText>
            </TouchableOpacity>
            <ThemedText style={{ fontWeight: "200" }}>{" and "}</ThemedText>
            <TouchableOpacity
              onPress={() => router.push("/(menu)/privacy-policy")}
            >
              <ThemedText type="link" style={{ fontWeight: "400" }}>
                Privacy Policy
              </ThemedText>
            </TouchableOpacity>
          </View>
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
    paddingVertical: 60,
  },
  logoImage: {
    width: 150,
    height: 150,
  },
  titleText: {
    marginTop: 60,
    marginBottom: 0,
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
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    // marginBottom:10
  },
  authLoginContainer: {
    // flexDirection: "row",
    // justifyContent: "space-between",
    width: "80%", // was 50%
    alignItems: "center",
    // marginVertical: 10,
  },
  authButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  authButtonText: {
    fontWeight: "semibold",
    marginLeft: 10,
    fontSize: 16,
  },
});
