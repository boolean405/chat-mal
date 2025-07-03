import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";

export default function Wallet() {
  const { user, clearUser } = useAuthStore(); // ✅ Always called
  const router = useRouter(); // ✅ Always called

  return (
    <ThemedView
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <ThemedText
        onPress={() => {
          clearUser();
          router.replace("/(auth)");
        }}
      >
        Clear User
      </ThemedText>

      <ThemedText onPress={() => console.log(user)}>Get User</ThemedText>
    </ThemedView>
  );
}
