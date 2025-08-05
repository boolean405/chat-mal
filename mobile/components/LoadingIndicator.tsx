import React from "react";
import { ActivityIndicator, useColorScheme } from "react-native";

import { ThemedView } from "./ThemedView";
import { Colors } from "@/constants/colors";

export default function LoadingIndicator() {
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];
  return (
    <ThemedView
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <ActivityIndicator size="large" color={color.primaryIcon} />
    </ThemedView>
  );
}
