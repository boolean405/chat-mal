import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { Colors } from "@/constants/colors";
import { useRouter } from "expo-router";
import { ThemedButton } from "./ThemedButton";

interface ScreenHeaderProps {
  title: string;
  rightButton?: string; // can be text or Ionicons name
  onRightPress?: () => void;
  onBackPress?: () => void;
}

export default function ScreenHeader({
  title,
  rightButton,
  onRightPress,
  onBackPress,
}: ScreenHeaderProps) {
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];
  const router = useRouter();

  // Simple check: if rightButton contains a dash, assume it's an Ionicons icon name
  const isIcon = rightButton?.includes("-");

  return (
    <ThemedView
      style={[styles.header, { borderBottomColor: color.primaryBorder }]}
    >
      {/* Left Side */}
      <View style={styles.leftContainer}>
        <TouchableOpacity onPress={onBackPress || (() => router.back())}>
          <Ionicons
            name="chevron-back-outline"
            size={22}
            color={color.primaryIcon}
          />
        </TouchableOpacity>
        <ThemedText type="headerTitle" style={styles.backText}>
          {title}
        </ThemedText>
      </View>

      {/* Right Side */}
      {rightButton &&
        (isIcon ? (
          <TouchableOpacity onPress={onRightPress}>
            <Ionicons
              name={rightButton as any}
              size={22}
              color={color.primaryIcon}
            />
          </TouchableOpacity>
        ) : (
          <ThemedButton
            style={styles.findButton}
            onPress={onRightPress}
            title={
              <ThemedText
                type="small"
                style={{ color: color.primaryBackground }}
              >
                {rightButton}
              </ThemedText>
            }
            isLoading={false}
          />
        ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    justifyContent: "space-between",
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: "bold",
  },
  findButton: {
    paddingVertical: 4,
    paddingHorizontal: 15,
  },
});
