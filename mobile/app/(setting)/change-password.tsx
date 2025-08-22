import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import {
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  Keyboard,
  StatusBar,
  TouchableOpacity,
  Alert,
  useColorScheme,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ThemedButton } from "@/components/ThemedButton";
import {
  changePassword,
  forgotPassword,
  createLocalPassword,
} from "@/api/user"; // ⬅️ add createLocalPassword
import ScreenHeader from "@/components/ScreenHeader";
import { useHeaderHeight } from "@react-navigation/elements";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useAuthStore } from "@/stores/authStore";

export default function CreatePassword() {
  const colorScheme = useColorScheme();
  const color = colorScheme === "dark" ? "white" : "black";
  const headerHeight = useHeaderHeight() + (StatusBar.currentHeight ?? 0);
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUserOnly); // if you have this; otherwise remove optimistic update below

  // Derived flag: does this account already have a local password?
  const hasLocal = useMemo(
    () => !!user?.authProviders?.some((p: any) => p?.provider === "local"),
    [user?.authProviders]
  );

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isOldPasswordError, setIsOldPasswordError] = useState(false);

  const [isInvalid, setIsInvalid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false); // forgot password loading

  useEffect(() => {
    // Validation rules:
    // - Always require new >= 8 and confirm >= 8 and match
    // - If hasLocal: also require old >= 8
    const baseInvalid =
      newPassword.length < 8 ||
      confirmNewPassword.length < 8 ||
      newPassword !== confirmNewPassword;

    const invalid = hasLocal
      ? baseInvalid || oldPassword.length < 8
      : baseInvalid;

    setIsInvalid(invalid);
  }, [hasLocal, oldPassword, newPassword, confirmNewPassword]);

  if (!user) return null; // Ensure user is defined before proceeding

  const sanitize = (text: string) =>
    text.replace(/[^A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g, "");

  const handleSubmit = async () => {
    Keyboard.dismiss();
    setIsError(false);
    setErrorMessage("");

    if (newPassword !== confirmNewPassword) {
      setIsError(true);
      setErrorMessage("Passwords do not match!");
      return;
    }

    setIsLoading(true);
    try {
      if (hasLocal) {
        // Change existing password
        const data = await changePassword({
          oldPassword,
          newPassword,
        });
        console.log(data.message);

        if (data?.status) {
          Alert.alert("Success", data.message);
        }
      } else {
        // Create/set local password (attach 'local' to authProviders)
        const data = await createLocalPassword({
          newPassword,
        });
        if (data.status) {
          // Optional optimistic update so UI flips to local mode without refetch
          try {
            const nextProviders = Array.isArray(user?.authProviders)
              ? [...user.authProviders]
              : [];
            if (!nextProviders.some((p: any) => p.provider === "local")) {
              nextProviders.push({
                provider: "local",
                providerId: user._id.toString(),
              });
            }
            setUser?.({ ...user, authProviders: nextProviders });
          } catch {}
          Alert.alert("Success", data.message);
        }
      }
      // Reset fields after success
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error: any) {
      if (error.status === 401)
        setIsOldPasswordError(true); // old password mismatch
      else setIsError(true);

      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!hasLocal) return; // No-op when there is no local provider
    setLoading(true);
    setIsError(false);
    setErrorMessage("");
    try {
      const data = await forgotPassword(user?.email);
      if (data?.status) {
        router.push({
          pathname: "/(auth)/forgot-password-verify",
          params: { email: user.email },
        });
      }
    } catch (error: any) {
      setIsError(true);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
      keyboardVerticalOffset={headerHeight}
    >
      {/* Header */}
      <ScreenHeader title={hasLocal ? "Change Password" : "Create Password"} />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedView style={styles.container}>
          <ThemedText style={styles.titleText}>
            {hasLocal ? "Change password" : "Create a new password"}
          </ThemedText>

          <ThemedView style={styles.inputGroupContainer}>
            {/* Old password — only when user has a local password */}
            {hasLocal && (
              <ThemedView
                style={[
                  styles.inputContainer,
                  { borderColor: color },
                  isOldPasswordError && { borderColor: "red" },
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={24}
                  style={{ color }}
                />
                <TextInput
                  style={[styles.textInput, { color }]}
                  placeholder="Old password"
                  autoComplete="current-password"
                  placeholderTextColor="gray"
                  value={oldPassword}
                  autoCapitalize="none"
                  secureTextEntry={!showOldPassword}
                  autoCorrect={false}
                  editable={!isLoading}
                  onChangeText={(text) => {
                    setIsError(false);
                    setIsOldPasswordError(false);
                    setOldPassword(sanitize(text));
                  }}
                />
                <Ionicons
                  style={{ color }}
                  name={showOldPassword ? "eye-off-outline" : "eye-outline"}
                  size={24}
                  onPress={() => setShowOldPassword((v) => !v)}
                />
              </ThemedView>
            )}

            {/* New password */}
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
                placeholder="New password"
                autoComplete="password-new"
                placeholderTextColor="gray"
                value={newPassword}
                autoCapitalize="none"
                secureTextEntry={!showNewPassword}
                autoCorrect={false}
                editable={!isLoading}
                onChangeText={(text) => {
                  setIsError(false);
                  setNewPassword(sanitize(text));
                }}
              />
              <Ionicons
                style={{ color }}
                name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                size={24}
                onPress={() => setShowNewPassword((v) => !v)}
              />
            </ThemedView>

            {/* Confirm new password */}
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
                placeholder="Confirm new password"
                autoComplete="password-new"
                placeholderTextColor="gray"
                value={confirmNewPassword}
                autoCapitalize="none"
                secureTextEntry={!showConfirmNewPassword}
                autoCorrect={false}
                editable={!isLoading}
                onSubmitEditing={() => !isInvalid && handleSubmit()}
                onChangeText={(text) => {
                  setIsError(false);
                  setConfirmNewPassword(sanitize(text));
                }}
              />
              <Ionicons
                style={{ color }}
                name={
                  showConfirmNewPassword ? "eye-off-outline" : "eye-outline"
                }
                size={24}
                onPress={() => setShowConfirmNewPassword((v) => !v)}
              />
            </ThemedView>
          </ThemedView>

          {(isError || isOldPasswordError) && (
            <ThemedText style={{ color: "red" }}>{errorMessage}</ThemedText>
          )}

          {/* Submit */}
          <ThemedButton
            style={[
              styles.button,
              (isInvalid || isLoading || isError || isOldPasswordError) && {
                opacity: 0.5,
              },
            ]}
            title={
              !isLoading && (hasLocal ? "Change password" : "Create password")
            }
            onPress={handleSubmit}
            disabled={isInvalid || isLoading || isError || isOldPasswordError}
            isLoading={isLoading}
          />

          {/* Forgot password — relevant only when local provider exists */}
          {hasLocal && (
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
          )}
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
  inputGroupContainer: {},
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 50,
  },
  titleText: {
    marginTop: 60,
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderBottomWidth: 1,
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
  forgotPasswordContainer: {
    width: "80%",
    marginTop: 10,
    alignItems: "flex-end",
    paddingRight: 20,
  },
});
