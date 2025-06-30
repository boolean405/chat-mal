// components/CustomActionSheet.tsx
import React from "react";
import {
  Modal,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetOption } from "@/types";

interface Props {
  color: any;
  visible: boolean;
  title?: string;
  options: BottomSheetOption[];
  onSelect: (index: number) => void;
  onCancel: () => void;
}

export default function BottomSheetAction({
  color,
  visible,
  title,
  options,
  onSelect,
  onCancel,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={onCancel}>
        <ThemedView style={styles.overlay}>
          <ThemedView
            style={[styles.sheet, { backgroundColor: color.secondary }]}
          >
            {title && (
              <ThemedText
                type="subtitle"
                style={[styles.title, { borderColor: color.borderColor }]}
              >
                {title}
              </ThemedText>
            )}
            {options.map(({ name, icon }, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => onSelect(index)}
                style={styles.optionButton}
              >
                <Ionicons
                  name={icon as keyof typeof Ionicons.glyphMap}
                  size={24}
                  color={color.icon}
                />
                <ThemedText
                  style={[
                    name === "Delete" && { color: "red" },
                    styles.nameText,
                  ]}
                >
                  {name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    paddingTop: 10,
    paddingLeft: 30,
  },
  title: {
    // textAlign: "center",
    padding: 12,
    borderBottomWidth: 0.5,
    // borderColor: "#eee",
  },
  optionButton: {
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  nameText: {
    paddingLeft: 15,
  },
});
