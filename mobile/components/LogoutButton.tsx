import React from "react";
import { ThemedText } from "@/components/ThemedText";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { useMessageStore } from "@/stores/messageStore";
import { Ionicons } from "@expo/vector-icons";
import { Alert, StyleSheet, TouchableOpacity } from "react-native";

export const LogoutButton: React.FC = () => {
  const { logout } = useAuthStore();
  const { clearAllChats } = useChatStore();
  const { clearAllMessages } = useMessageStore();
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          // api here
          try {
            // Uncomment the following lines if you have a logout API endpoint
            // const data = await logout();
            // if (!data.status) {
            //   Alert.alert("Error", data.message || "Failed to logout!");
            //   return;
            // }

            // clearUser();
            clearAllChats();
            clearAllMessages();
            logout(); // include routing to auth
          } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to logout!");
            return;
          }
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
      <ThemedText type="large" style={styles.text}>
        Logout
      </ThemedText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    backgroundColor: "#d9534f",
  },
  text: {
    marginLeft: 8,
    color: "#fff",
    fontWeight: "semibold",
  },
});
