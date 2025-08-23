import {
  View,
  useColorScheme,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import React from "react";
import { ServiceItem as ServiceItemType } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { ThemedText } from "./ThemedText";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 50) / 2; // screen width minus paddings/gaps
const CARD_HEIGHT = 60;

export default function ServiceItem({
  item,
  onPress,
}: {
  item: ServiceItemType;
  onPress: () => void;
}) {
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: color.secondaryBackground }]}
      onPress={onPress}
    >
      <View style={styles.card}>
        <Ionicons name={item.iconName} size={24} color={item.color} />
        <ThemedText numberOfLines={1}>{item.label}</ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    marginBottom: 15,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
});
