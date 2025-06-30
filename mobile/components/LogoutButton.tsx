import { ThemedText } from "@/components/ThemedText";
import { clearUserData } from "@/storage/authStorage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, StyleSheet, TouchableOpacity } from "react-native";

const router = useRouter();

export const LogoutButton: React.FC = () => {
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          // api here
          await clearUserData();
          router.replace("/(auth)");
        },
      },
    ]);
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleLogout}
      activeOpacity={0.8}
    >
      <Ionicons name="log-out-outline" size={20} color="#fff" />
      <ThemedText style={styles.text}>Logout</ThemedText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    backgroundColor: "#d9534f",
  },
  text: {
    marginLeft: 8,
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
