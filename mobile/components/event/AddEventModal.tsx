import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
  Alert,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/colors";
import {
  addHours,
  format,
  isAfter,
  isEqual,
  set as setDT,
  startOfHour,
} from "date-fns";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

type Props = {
  visible: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    startAt: Date;
    description?: string;
  }) => Promise<void> | void;
};

export default function AddEventModal({
  visible,
  isSubmitting,
  onClose,
  onSubmit,
}: Props) {
  const scheme = useColorScheme();
  const color = Colors[scheme ?? "light"];

  // Default: next whole hour (e.g., 14:23 -> 15:00)
  const defaultStart = useMemo(() => addHours(startOfHour(new Date()), 1), []);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState<Date>(defaultStart);

  // Pickers visibility
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false); // Android two-step

  // Simple validation
  const [errors, setErrors] = useState<{ title?: string; startAt?: string }>(
    {}
  );

  const validate = (candidate: Date = startAt) => {
    const nextErrors: typeof errors = {};
    if (!title.trim()) nextErrors.title = "Title is required.";
    const now = new Date();
    if (!(isAfter(candidate, now) || isEqual(candidate, now))) {
      nextErrors.startAt = "Choose a date/time in the future.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const openDateTimeFlow = () => {
    if (Platform.OS === "ios") {
      setShowDatePicker(true); // iOS uses one "datetime" picker
    } else {
      // Android: start with date, then time
      setShowDatePicker(true);
    }
  };

  // iOS handler (datetime) or Android date step
  const handleChangeDate = (e: DateTimePickerEvent, d?: Date) => {
    setShowDatePicker(false);
    if (e.type !== "set" || !d) return;

    if (Platform.OS === "ios") {
      // iOS "datetime" already has both parts
      setStartAt(d);
    } else {
      // Android: we only got the date; now open time picker using existing time
      const withPickedDate = setDT(startAt, {
        year: d.getFullYear(),
        month: d.getMonth(),
        date: d.getDate(),
      });
      setStartAt(withPickedDate);
      setShowTimePicker(true);
    }
  };

  // Android time step
  const handleChangeTime = (e: DateTimePickerEvent, d?: Date) => {
    setShowTimePicker(false);
    if (e.type !== "set" || !d) return;
    const withPickedTime = setDT(startAt, {
      hours: d.getHours(),
      minutes: d.getMinutes(),
      seconds: 0,
      milliseconds: 0,
    });
    setStartAt(withPickedTime);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validate()) {
      // optional UX: surface first error
      const msg = errors.title || errors.startAt;
      if (msg) Alert.alert("Invalid input", msg);
      return;
    }

    await onSubmit({
      title: title.trim(),
      startAt,
      description: description.trim() || undefined,
    });

    // reset for next add
    setTitle("");
    setDescription("");
    const nextDefault = addHours(startOfHour(new Date()), 1);
    setStartAt(nextDefault);
    setErrors({});
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: "height" })}
        style={styles.overlay}
      >
        <View style={styles.insideContainer}>
          <ThemedView
            style={[styles.card, { backgroundColor: color.tertiaryBackground }]}
          >
            <ThemedText style={styles.header}>Add Event</ThemedText>

            {/* Title */}
            <ThemedText style={styles.label}>Title</ThemedText>
            <View
              style={[
                styles.inputWrapper,
                { borderColor: color.primaryBorder },
              ]}
            >
              <Ionicons
                name="create-outline"
                size={18}
                color={color.primaryIcon}
              />
              <TextInput
                value={title}
                onChangeText={(t) => {
                  setTitle(t);
                  if (Object.keys(errors).length) validate();
                }}
                placeholder="e.g. Anniversary dinner"
                placeholderTextColor="gray"
                editable={!isSubmitting}
                style={[styles.input, { color: color.primaryText }]}
                returnKeyType="done"
              />
            </View>
            {errors.title ? (
              <ThemedText style={styles.errorText}>{errors.title}</ThemedText>
            ) : null}

            {/* Date & Time */}
            <ThemedText style={styles.label}>Start at</ThemedText>
            <TouchableOpacity
              onPress={openDateTimeFlow}
              style={[styles.pillButton, { borderColor: color.primaryBorder }]}
              activeOpacity={0.7}
              disabled={isSubmitting}
            >
              <View style={styles.row}>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={color.primaryIcon}
                />
                <ThemedText style={styles.boldText}>
                  {format(startAt, "PP p")}
                </ThemedText>
              </View>
            </TouchableOpacity>
            {errors.startAt ? (
              <ThemedText style={styles.errorText}>{errors.startAt}</ThemedText>
            ) : null}

            {/* Description */}
            <ThemedText style={styles.label}>Description (optional)</ThemedText>
            <View
              style={[
                styles.inputWrapper,
                { borderColor: color.primaryBorder },
              ]}
            >
              <Ionicons
                name="document-text-outline"
                size={18}
                color={color.primaryIcon}
              />
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Add details…"
                placeholderTextColor="gray"
                editable={!isSubmitting}
                style={[styles.input, { color: color.primaryText }]}
                multiline
              />
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              {/* Cancel */}
              <TouchableOpacity
                style={styles.btn}
                onPress={onClose}
                activeOpacity={0.7}
                disabled={isSubmitting}
              >
                <ThemedText>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.btn,
                  {
                    opacity: isSubmitting || title.trim() === "" ? 0.5 : 1,
                    backgroundColor: color.primaryButtonBackground,
                  },
                ]}
                onPress={handleSubmit}
                activeOpacity={0.7}
                disabled={!!isSubmitting || title.trim() === ""}
              >
                <View style={styles.btnContent}>
                  {isSubmitting ? (
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
        </View>

        {/* iOS: single datetime picker; Android: date then time */}
        {showDatePicker && (
          <DateTimePicker
            value={startAt}
            mode={Platform.OS === "ios" ? "datetime" : "date"}
            display="default"
            onChange={handleChangeDate}
            // iOS supports min for date/time as 'minimumDate'; Android will enforce in validation step
            minimumDate={new Date()}
          />
        )}

        {Platform.OS === "android" && showTimePicker && (
          <DateTimePicker
            value={startAt}
            mode="time"
            is24Hour
            display="default"
            onChange={handleChangeTime}
          />
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  insideContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 35,
    // backgroundColor: "rgba(0,0,0,0.5)",
  },
  card: { borderRadius: 16, padding: 16 },
  header: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  label: { fontSize: 16, opacity: 0.7, marginTop: 8, marginBottom: 8 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0.4,
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 6,
  },
  input: {
    flex: 1,
    paddingVertical: Platform.select({ ios: 10, android: 10 }),
    lineHeight: 22,
  },
  pillButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0.4,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  boldText: { fontWeight: "600" },
  errorText: { color: "#ff3b30", marginTop: 6 },
  actions: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  btn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10 },
  btnContent: {
    minWidth: 40,
    minHeight: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
