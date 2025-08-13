import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/colors";

type Props = {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  trailing?: React.ReactNode;
  disabled?: boolean;
};

export default function InfoRow({
  title,
  subtitle,
  icon = "information-circle-outline",
  onPress,
  trailing,
  disabled,
}: Props) {
  const cs = useColorScheme();
  const color = Colors[cs ?? "light"];
  const Comp = onPress ? TouchableOpacity : View;

  return (
    <Comp
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.row,
        {
          backgroundColor: color.secondaryBackground,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <View style={styles.left}>
        <Ionicons
          name={icon}
          size={20}
          color={color.primaryIcon}
          style={{ marginRight: 10 }}
        />
        <View style={{ flex: 1 }}>
          <ThemedText type="defaultBold">{title}</ThemedText>
          {subtitle ? (
            <ThemedText style={{ opacity: 0.7 }} numberOfLines={1}>
              {subtitle}
            </ThemedText>
          ) : null}
        </View>
      </View>
      <View style={styles.right}>{trailing}</View>
    </Comp>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  left: { flexDirection: "row", alignItems: "center", flex: 1 },
  right: { marginLeft: 10 },
});
