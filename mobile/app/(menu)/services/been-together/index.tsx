// app/been-together.tsx (your parent)
import React, { useState } from "react";
import {
  Modal,
  TextInput,
  View,
  TouchableOpacity,
  Platform,
  StyleSheet,
  useColorScheme,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import DaysTogetherPill from "@/components/been-together/DaysTogetherPill";
import UserAvatarCard from "@/components/been-together/UserAvatarCard";
import ScreenHeader from "@/components/ScreenHeader";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { SERVER_URL } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { Colors } from "@/constants/colors";
import { format } from "date-fns";

export default function BeenTogether() {
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];

  const [title, setTitle] = useState("Falling in Love");
  const [titleDraft, setTitleDraft] = useState(title);
  const [isEditing, setIsEditing] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(
    new Date("2025-08-05T00:00:00.000Z")
  );
  const [startDateDraft, setStartDateDraft] = useState(startDate);

  // Title edit handlers
  const openEditor = () => {
    setTitleDraft(title);
    setIsEditing(true);
  };
  const saveData = () => {
    const next = titleDraft.trim();
    setStartDate(startDateDraft);
    if (next) setTitle(next);
    setIsEditing(false);
  };

  // Date edit handlers
  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (event.type === "set" && selectedDate) {
      setStartDateDraft(selectedDate);
      console.log("start date draft:", startDateDraft);
      console.log("startDate:       ", startDate);

      console.log("Selected date:   ", selectedDate);
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScreenHeader title="Been Together" />

      <ThemedView style={{ paddingHorizontal: 20 }}>
        <DaysTogetherPill
          startDateISO={startDate.toISOString().split("T")[0]}
          title={title}
          onEdit={openEditor}
        />

        {/* Avatars + center heart */}
        <ThemedView style={styles.row}>
          <ThemedView style={styles.sideCol}>
            <UserAvatarCard
              name="Boolean"
              age={25}
              gender="male"
              zodiac="aries"
              imageUri={`${SERVER_URL}/image/profile-photo`}
            />
          </ThemedView>

          <ThemedView style={styles.centerCol}>
            <Ionicons name="heart" size={52} color={"#f7028e"} />
          </ThemedView>

          <ThemedView style={styles.sideCol}>
            <UserAvatarCard
              name="Khay"
              age={24}
              gender="female"
              zodiac="leo"
              imageUri={`${SERVER_URL}/image/profile-photo`}
            />
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Edit modal */}
      <Modal
        transparent
        visible={isEditing}
        animationType="fade"
        onRequestClose={() => setIsEditing(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: "height" })}
          style={modalStyles.overlay}
        >
          <ThemedView
            style={[
              modalStyles.card,
              { backgroundColor: color.tertiaryBackground },
            ]}
          >
            <ThemedText style={modalStyles.label}>Edit title</ThemedText>

            {/* Title input with icon */}
            <View
              style={[
                modalStyles.inputWrapper,
                { borderColor: color.primaryBorder },
              ]}
            >
              <Ionicons
                name="pencil-outline"
                size={18}
                color={color.primaryIcon}
              />
              <TextInput
                value={titleDraft}
                onChangeText={setTitleDraft}
                placeholder="Title"
                placeholderTextColor="gray"
                autoFocus
                returnKeyType="done"
                onSubmitEditing={saveData}
                style={[modalStyles.input, { color: color.primaryText }]}
              />
            </View>

            {/* Edit date */}
            <ThemedText style={modalStyles.label}>Edit start date</ThemedText>

            {/* Left: picked date */}
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={[modalStyles.dateRow]}
              activeOpacity={0.7}
            >
              <View
                style={[
                  modalStyles.dateContainer,
                  { borderColor: color.primaryBorder },
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={color.primaryIcon}
                />
                <ThemedText style={[modalStyles.dateValue]}>
                  {format(startDateDraft, "PP")}
                </ThemedText>
              </View>
            </TouchableOpacity>

            {/* Actions */}
            <View style={modalStyles.actions}>
              <TouchableOpacity
                style={[modalStyles.btn]}
                onPress={() => {
                  setStartDateDraft(startDate);
                  setIsEditing(false);
                }}
                activeOpacity={0.7}
              >
                <ThemedText>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  modalStyles.btn,
                  {
                    backgroundColor: color.primaryButtonBackground,
                    opacity:
                      !titleDraft.trim() ||
                      (titleDraft === title &&
                        startDateDraft.getTime() === startDate.getTime())
                        ? 0.5
                        : 1,
                  },
                ]}
                onPress={saveData}
                activeOpacity={0.7}
                disabled={
                  !titleDraft.trim() ||
                  (titleDraft === title &&
                    startDateDraft.getTime() === startDate.getTime())
                }
              >
                <ThemedText style={{ color: color.primaryBackground }}>
                  Save
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Date picker */}
      {showDatePicker && (
        <DateTimePicker
          value={startDateDraft}
          mode="date"
          display="default"
          onChange={onChangeDate}
          maximumDate={new Date()} // optional: prevent picking future
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  sideCol: { flex: 1, alignItems: "center" },
  centerCol: { width: 80, alignItems: "center", justifyContent: "center" },
});

const modalStyles = StyleSheet.create({
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
  btn: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 10 },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  dateValue: {
    fontWeight: "600",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 0.4,
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
  input: {
    flex: 1, // so it takes the remaining space
    paddingVertical: 8,
    lineHeight: 22,
  },
});
