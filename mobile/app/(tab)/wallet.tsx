import { LogoutButton } from "@/components/LogoutButton";
import { useAuthStore } from "@/stores/authStore";
import React from "react";
import { Text, View } from "react-native";

export default function Wallet() {
  const clearUser = useAuthStore((state) => state.clearUser);
  const user = useAuthStore((state) => state.user);
  if (!clearUser) return null; // Ensure clearUser is defined before proceeding
  return (
    <View>
      <Text onPress={() => clearUser()}>Camera</Text>
      <Text onPress={async () => console.log(user)}>Camera</Text>
      {/* <LogoutButton /> */}
    </View>
  );
}
