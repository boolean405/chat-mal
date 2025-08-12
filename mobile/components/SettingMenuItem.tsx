import {
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import React from "react";
import { ThemedView } from "./ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";
import { SettingMenuItem as SettingItem } from "@/types";
import { Colors } from "@/constants/colors";

interface SettingMenuItemProps {
  item: SettingItem;
  disabled: boolean;
  onPress: () => void;
}

export default function SettingMenuItem({
  item,
  disabled,
  onPress,
}: SettingMenuItemProps) {
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={styles.container}
    >
      <ThemedView
        style={[
          styles.listItem,
          {
            backgroundColor: color.secondaryBackground,
          },
        ]}
      >
        <Ionicons
          name={item.iconName}
          size={24}
          color={color.primaryIcon}
          style={styles.leftIcon}
        />

        <View style={styles.textContainer}>
          <ThemedText
            type="large"
            style={styles.titleText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.title}
          </ThemedText>
          <ThemedText style={styles.descText} numberOfLines={1}>
            {item.desc}
          </ThemedText>
        </View>

        <Ionicons
          name="chevron-down-outline"
          size={24}
          color={color.primaryIcon}
          style={styles.rightIcon}
        />
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%", // ensure parent width is full
  },
  listItem: {
    width: "100%", // row fills available width
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    marginVertical: 5,
    // borderWidth: 0.2,
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  leftIcon: {
    flexShrink: 0, // icons should NOT shrink
  },
  textContainer: {
    flex: 1, // take remaining space
    flexShrink: 1, // allow shrinking so chevron stays visible
    marginHorizontal: 15,
    overflow: "hidden", // ensures ellipsis works cleanly
  },
  titleText: {
    // keep title to one line; remove numberOfLines if you want wrapping
  },
  descText: {
    color: "gray",
  },
  rightIcon: {
    flexShrink: 0, // keep chevron visible
  },
});
