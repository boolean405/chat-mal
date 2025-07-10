import React from "react";
import { StyleSheet, useColorScheme } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/colors";

export default function ChatEmpty() {
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];

  return (
    <ThemedView style={styles.emptyContainer}>
      <Ionicons name="chatbubble-outline" size={50} color={color.secondary} />
      <ThemedText style={{ color: color.secondary }}>No Chats Found</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
  },
});
