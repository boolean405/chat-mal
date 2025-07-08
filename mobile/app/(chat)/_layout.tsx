import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from "@/components/ThemedView";

export default function ChatLayout() {
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={{ flex: 1, paddingBottom: insets.bottom }}>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemedView>
  );
}
