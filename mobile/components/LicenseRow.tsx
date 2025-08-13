import { Colors } from "@/constants/colors";
import React from "react";
import {
  TouchableOpacity,
  View,
  Linking,
  useColorScheme,
  StyleSheet,
} from "react-native";
import { ThemedText } from "./ThemedText";

type Props = {
  name: string;
  licenseName?: string;
  description?: string;
  developers?: string;
  website?: string;
  version?: string; // new prop
  onPress?: () => void;
};

export default function LicenseRow({
  name,
  licenseName,
  description,
  website,
  version,
  onPress,
}: Props) {
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, { backgroundColor: color.secondaryBackground }]}
    >
      <View style={{ paddingVertical: 12, gap: 4 }}>
        {/* Name + Version row */}
        <View style={styles.nameRow}>
          <ThemedText type="large" style={styles.name}>
            {name}
          </ThemedText>
          {version ? (
            <ThemedText style={styles.version}>@{version}</ThemedText>
          ) : null}
        </View>

        {licenseName ? (
          <ThemedText style={styles.license}>{licenseName}</ThemedText>
        ) : null}

        {description ? (
          <ThemedText style={styles.description}>{description}</ThemedText>
        ) : null}

        {website ? (
          <ThemedText type="link" onPress={() => Linking.openURL(website)}>
            {website}
          </ThemedText>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    marginVertical: 5,
    paddingHorizontal: 10,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
  },
  name: {
    fontWeight: "bold",
  },
  version: {
    opacity: 0.6,
  },
  license: {
    opacity: 0.7,
  },
  description: {
    opacity: 0.6,
  },
});
