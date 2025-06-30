import React from "react";
import { useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from "./ThemedView";

export default function SafeScreen({ children }: React.PropsWithChildren) {
  const insets = useSafeAreaInsets();
  return (
    <ThemedView style={{ flex: 1, paddingTop: insets.top }}>
      {children}
    </ThemedView>
  );
}
