import React from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  TextInput,
  Platform,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/colors";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { format } from "date-fns";
import { User } from "@/types";
import { Image } from "expo-image";

type Props = {
  visible: boolean;
  isLoading: boolean;

  partner: User | null;
  onPressPartner: () => void;

  titleDraft: string;
  onChangeTitle: (v: string) => void;

  lovedAtDraft: Date;
  onPressPickDate: () => void; // parent flips showDatePicker

  eventsDayCountDraft: number;
  onDecWithin: () => void;
  onIncWithin: () => void;

  isUnchanged: boolean;
  onCancel: () => void;
  onSave: () => void;
};

export default function EditRelationshipModal({
  partner,
  visible,
  titleDraft,
  isUnchanged,
  isLoading,
  lovedAtDraft,
  eventsDayCountDraft,
  onSave,
  onCancel,
  onIncWithin,
  onDecWithin,
  onChangeTitle,
  onPressPartner,
  onPressPickDate,
}: Props) {
  const scheme = useColorScheme();
  const color = Colors[scheme ?? "light"];

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: "height" })}
        style={styles.overlay}
      >
        <ThemedView
          style={[styles.card, { backgroundColor: color.tertiaryBackground }]}
        >
          {/* Title */}
          <ThemedText style={styles.label}>Title</ThemedText>

          <View
            style={[styles.inputWrapper, { borderColor: color.primaryBorder }]}
          >
            <Ionicons
              name="pencil-outline"
              size={18}
              color={color.primaryIcon}
            />
            <TextInput
              value={titleDraft}
              onChangeText={onChangeTitle}
              placeholder="Title"
              placeholderTextColor="gray"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={onSave}
              editable={!isLoading}
              style={[styles.input, { color: color.primaryText }]}
            />
          </View>

          {/* Date */}
          <ThemedText style={styles.label}>Start loved at</ThemedText>
          <TouchableOpacity
            onPress={onPressPickDate}
            style={[styles.pillButton, { borderColor: color.primaryBorder }]}
            activeOpacity={0.7}
            accessibilityRole="button"
            disabled={isLoading}
          >
            <View
              style={[
                styles.dateContainer,
                { borderColor: color.primaryBorder },
              ]}
            >
              <Ionicons
                name="calendar-outline"
                size={18}
                color={color.primaryIcon}
              />
              <ThemedText style={[styles.dateValue]}>
                {format(lovedAtDraft, "PP")}
              </ThemedText>
            </View>
          </TouchableOpacity>

          {/* Events window */}
          <ThemedText style={styles.label}>Show upcoming events</ThemedText>
          <View style={styles.stepperRow}>
            {/* Minus */}
            <TouchableOpacity
              accessibilityRole="button"
              onPress={onDecWithin}
              activeOpacity={0.7}
              style={[styles.stepperBtn, { borderColor: color.primaryBorder }]}
              disabled={eventsDayCountDraft <= 1 || isLoading}
            >
              <Ionicons
                name="remove-outline"
                size={18}
                color={color.primaryIcon}
              />
            </TouchableOpacity>

            <ThemedText style={styles.stepperValue}>
              {eventsDayCountDraft} day{eventsDayCountDraft > 1 ? "s" : ""}
            </ThemedText>

            {/* Plus */}
            <TouchableOpacity
              accessibilityRole="button"
              onPress={onIncWithin}
              activeOpacity={0.7}
              style={[styles.stepperBtn, { borderColor: color.primaryBorder }]}
              disabled={isLoading}
            >
              <Ionicons
                name="add-outline"
                size={18}
                color={color.primaryIcon}
              />
            </TouchableOpacity>
          </View>

          {/* Choose or remove partner */}
          <ThemedText style={styles.label}>Partner</ThemedText>
          <TouchableOpacity
            onPress={onPressPartner}
            style={[
              styles.pillButton,
              partner
                ? { borderColor: "red" }
                : { borderColor: color.primaryBorder },
            ]}
            activeOpacity={0.7}
            accessibilityRole="button"
            disabled={isLoading}
          >
            <View style={[styles.dateContainer]}>
              {partner ? (
                <Image
                  source={{ uri: partner.profilePhoto }}
                  style={{ width: 18, height: 18, borderRadius: 9 }}
                />
              ) : (
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={color.primaryIcon}
                />
              )}
              <ThemedText
                style={[styles.dateValue, partner && { color: "red" }]}
              >
                {partner ? "Remove partner" : "Choose a partner"}
              </ThemedText>
            </View>
          </TouchableOpacity>

          {/* Actions buttons */}
          <View style={styles.actions}>
            {/* Cancel btn */}
            <TouchableOpacity
              style={[styles.btn]}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <ThemedText>Cancel</ThemedText>
            </TouchableOpacity>

            {/* Save btn */}
            <TouchableOpacity
              style={[
                styles.btn,
                {
                  backgroundColor: color.primaryButtonBackground,
                  opacity: isUnchanged || !titleDraft.trim() ? 0.5 : 1,
                },
              ]}
              onPress={onSave}
              activeOpacity={0.7}
              disabled={isUnchanged || !titleDraft.trim()}
            >
              <View style={styles.btnContent}>
                {isLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={color.primaryBackground}
                  />
                ) : (
                  <ThemedText style={{ color: color.primaryBackground }}>
                    Save
                  </ThemedText>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  card: { borderRadius: 16, padding: 16 },
  label: { fontSize: 16, opacity: 0.7, marginBottom: 8 },
  actions: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  btn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  btnContent: {
    minWidth: 40, // ensures enough horizontal space for "Save"
    minHeight: 20, // ensures vertical consistency
    alignItems: "center",
    justifyContent: "center",
  },
  dateValue: { fontWeight: "600" },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0.4,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 15,
    gap: 2,
  },
  input: { flex: 1, paddingVertical: 8, lineHeight: 22 },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 15,
  },
  stepperBtn: {
    borderWidth: 0.4,
    borderRadius: 30,
    paddingVertical: 3,
    paddingHorizontal: 3,
    alignItems: "center",
    justifyContent: "center",
    alignContent: "center",
    alignSelf: "center",
  },
  stepperValue: { fontSize: 16, textAlign: "center" },
  pillButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0.4,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
    marginBottom: 15,
  },
});
