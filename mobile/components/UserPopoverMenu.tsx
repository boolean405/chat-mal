import React from "react";
import Popover from "react-native-popover-view";
import { useColorScheme, TouchableOpacity, View } from "react-native";

import { User } from "@/types";
import { Colors } from "@/constants/colors";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";

type UserPopoverMenuProps = {
  user: User | null;
  onRequestClose: () => void;
  fromRef: React.RefObject<any>;
  options: {
    label: string;
    onPress: () => void;
    icon?: keyof typeof Ionicons.glyphMap;
    destructive?: boolean;
  }[];
};

export default function UserPopoverMenu({
  user,
  fromRef,
  options,
  onRequestClose,
}: UserPopoverMenuProps) {
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];

  if (!user || !fromRef) return null;

  return (
    <Popover
      isVisible={!!user}
      from={fromRef}
      onRequestClose={onRequestClose}
      popoverStyle={{
        backgroundColor: color.secondaryBackground,
      }}
    >
      {options.map((option, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => {
            onRequestClose();
            option.onPress();
          }}
          style={{ padding: 10 }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {option.icon && (
              <Ionicons
                name={option.icon}
                size={16}
                color={option.destructive ? "red" : color.primaryText}
                style={{ marginRight: 8 }} // space between icon and text
              />
            )}
            <ThemedText
              style={{
                color: option.destructive ? "red" : color.primaryText,
              }}
            >
              {option.label}
            </ThemedText>
          </View>
        </TouchableOpacity>
      ))}
    </Popover>
  );
}
