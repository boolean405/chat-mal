import React from "react";
import { StyleSheet, useColorScheme, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/colors";

type Props = { title: string; children: React.ReactNode };

export default function SectionCard({ title, children }: Props) {
  const cs = useColorScheme();
  const color = Colors[cs ?? "light"];
  return (
    <View style={[styles.card, { backgroundColor: color.secondaryBackground }]}>
      <ThemedText type="larger" style={{ marginBottom: 12 }}>
        {title}
      </ThemedText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
});
