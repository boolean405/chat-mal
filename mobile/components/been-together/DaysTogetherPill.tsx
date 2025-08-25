// DaysTogetherPill.tsx
import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import {
  humanizeSinceISO,
  todayLocalISO,
  totalDaysSinceISO,
} from "@/utils/since";
import { Colors } from "@/constants/colors";

type Props = {
  startDateISO?: string;
  title?: string;
  onEdit?: () => void; // edit start date (existing)
  onTitlePress?: () => void; // NEW: parent handles title editing
};

export default function DaysTogetherPill({
  startDateISO = todayLocalISO(),
  title = "We've been together for",
  onEdit,
  onTitlePress,
}: Props) {
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];
  const duo = humanizeSinceISO(startDateISO);
  const days = totalDaysSinceISO(startDateISO);

  return (
    <ThemedView
      style={[styles.card, { backgroundColor: color.secondaryBackground }]}
    >
      {/* Edit start date button (top-right) */}
      {onEdit && (
        <TouchableOpacity
          onPress={onEdit}
          style={styles.editBtn}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Edit start date"
        >
          <Ionicons name="create-outline" size={22} color={color.primaryIcon} />
        </TouchableOpacity>
      )}

      {/* Title (press to let parent handle editing) */}
      {onTitlePress ? (
        <TouchableOpacity
          onPress={onTitlePress}
          activeOpacity={0.7}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessibilityRole="button"
          accessibilityLabel="Edit title"
        >
          <ThemedText style={styles.title} numberOfLines={2}>
            {title}
          </ThemedText>
        </TouchableOpacity>
      ) : (
        <ThemedText style={styles.title}>{title}</ThemedText>
      )}

      {/* Main row */}
      <View style={styles.row}>
        <View style={styles.daysBox}>
          <ThemedText style={styles.daysNumber}>{days}</ThemedText>
          <ThemedText style={styles.daysLabel}>
            {days <= 1 ? "day" : "days"}
          </ThemedText>
        </View>

        <View style={styles.divider}>
          <Ionicons name="heart" size={20} color="#f7028e" />
        </View>

        <View style={styles.infoBox}>
          <View
            style={[styles.chip, { backgroundColor: color.tertiaryBackground }]}
          >
            <ThemedText style={styles.chipText}>{duo}</ThemedText>
          </View>
          {days > 0 ? (
            <ThemedText style={styles.sinceText}>
              since {startDateISO}
            </ThemedText>
          ) : days === 0 ? (
            <ThemedText style={styles.sinceText}>
              Today, you were together!
            </ThemedText>
          ) : null}
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 10,
    width: "100%",
    alignSelf: "center",
    position: "relative",
  },
  editBtn: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    alignSelf: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    gap: 12,
  },
  daysBox: { alignItems: "center" },
  daysNumber: { fontSize: 28, fontWeight: "800", letterSpacing: 0.2 },
  daysLabel: {
    marginTop: 2,
    fontSize: 12,
    opacity: 0.7,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  divider: {
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  infoBox: { alignItems: "center" },
  chip: {
    alignSelf: "flex-end",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chipText: { fontSize: 14, fontWeight: "700" },
  sinceText: { marginTop: 6, fontSize: 12, opacity: 0.7 },
});
