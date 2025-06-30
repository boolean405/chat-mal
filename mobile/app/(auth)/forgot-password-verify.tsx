import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { forgotPassword, forgotPasswordVerify } from "@/api/user"

export default function VerifyEmailScreen() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(59);
  const [canResend, setCanResend] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const inputs = useRef<Array<TextInput | null>>([]);

  const router = useRouter();
  const colorScheme = useColorScheme();
  const color = colorScheme === "dark" ? "white" : "black";

  const { email } = useLocalSearchParams();

  useEffect(() => {
    let timer: any;
    if (resendTimer > 0) {
      timer = setTimeout(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleResend = async () => {
    if (!canResend) return;
    setResendTimer(59);
    setCanResend(false);

    // Register again because need code again
    setIsLoading(true);
    try {
      await forgotPassword(email);
    } catch (error: any) {
      setIsError(true);
      setErrorMessage(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnChange = async (text: string, index: number) => {
    // Always clear error when input changes
    setIsError(false);

    if (/^\d$/.test(text) || text === "") {
      const newCode = [...code];
      newCode[index] = text;
      setCode(newCode);
      if (text && index < 5) {
        inputs.current[index + 1]?.focus();
      }
      const allFilled = newCode.every((digit) => digit !== "");
      if (allFilled) {
        const code = newCode.join("");

        // Api code here
        setIsLoading(true);
        try {
          const data = await forgotPasswordVerify(email, code);
          if (data.status) {
            setIsVerified(true);
            await new Promise((r) => setTimeout(r, 1e3));
            router.replace({
              pathname: "/(auth)/reset-password",
              params: { email },
            });
          }
        } catch (error: any) {
          setIsError(true);
          setErrorMessage(error.message);
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && code[index] === "" && index > 0) {
      inputs.current[index - 1]?.focus();
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
          <ThemedText type="subtitle">Verify your email</ThemedText>
          <ThemedText style={styles.titleText}>
            Enter verify code, check in your email
          </ThemedText>
          <ThemedText>"{email}"</ThemedText>
          <ThemedText
            type="defaultItalic"
            style={{ marginBottom: 20, marginTop: 5 }}
          >
            Don't forget to check also in your spam folder
          </ThemedText>

          <ThemedView style={styles.inputContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputs.current[index] = ref;
                }}
                style={[
                  styles.codeInput,
                  { color, borderColor: color },
                  isError && { borderColor: "red" },
                  isVerified && { borderColor: "green" },
                  isLoading && { opacity: 0.5 },
                ]}
                editable={!isLoading}
                autoFocus={index === 0 && code.every((d) => d === "")}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onKeyPress={(e) => handleKeyPress(e, index)}
                onChangeText={(text) => handleOnChange(text, index)}
              />
            ))}
          </ThemedView>
          {isError && (
            <ThemedText style={{ color: "red" }}>{errorMessage}</ThemedText>
          )}

          {isLoading ? (
            <ActivityIndicator size="small" color={color} />
          ) : (
            <ThemedView style={styles.resendContainer}>
              {canResend ? (
                <TouchableOpacity disabled={isLoading} onPress={handleResend}>
                  <ThemedText>Resend</ThemedText>
                </TouchableOpacity>
              ) : (
                <ThemedText style={{ opacity: 0.5 }}>
                  Resend available in {resendTimer}s
                </ThemedText>
              )}
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
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  titleText: {
    marginTop: 60,
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: 10,
  },
  codeInput: {
    borderWidth: 1,
    borderRadius: 8,
    width: 40,
    height: 50,
    textAlign: "center",
    fontSize: 18,
  },
  resendContainer: {
    alignItems: "center",
    marginTop: 10,
  },
});
