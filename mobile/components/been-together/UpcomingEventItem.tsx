import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/colors";
import { UpcomingEvent } from "@/types";
import { formatEventDateParts, daysUntil } from "@/utils/dates";

type Props = {
  item: UpcomingEvent;
  onPress?: (e: UpcomingEvent) => void;
};

export default function UpcomingEventItem({ item, onPress }: Props) {
  const scheme = useColorScheme();
  const color = Colors[scheme ?? "light"];

  const d = daysUntil(item.startAt);
  const badgeText =
    d === 1
      ? "Tomorrow"
      : d === -1
      ? "Past yesterday"
      : d > 1
      ? `Coming in ${d} days`
      : d < -1
      ? `Past ${Math.abs(d)} days`
      : "Today";

  const { date, time } = formatEventDateParts(item.startAt);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress?.(item)}
      style={[
        styles.row,
        {
          backgroundColor: color.secondaryBackground,
        },
      ]}
    >
      {/* Left section */}
      <View style={styles.left}>
        <View style={styles.dateTimeRow}>
          {/* Date pill */}
          <View
            style={[
              styles.datePill,
              { backgroundColor: color.tertiaryBackground },
            ]}
          >
            <Ionicons
              name="calendar-outline"
              size={14}
              color={color.tertiaryIcon}
            />
            <ThemedText
              style={[styles.dateText, { color: color.tertiaryText }]}
            >
              {date}
            </ThemedText>
          </View>

          {/* Time pill */}
          <View
            style={[
              styles.datePill,
              { backgroundColor: color.tertiaryBackground },
            ]}
          >
            <Ionicons
              name="time-outline"
              size={14}
              color={color.tertiaryIcon}
            />
            <ThemedText
              style={[styles.dateText, { color: color.tertiaryText }]}
            >
              {time}
            </ThemedText>
          </View>
        </View>

        <ThemedText
          numberOfLines={1}
          style={[styles.title, { color: color.primaryText }]}
        >
          {item.title}
        </ThemedText>

        {item.description ? (
          <ThemedText
            numberOfLines={1}
            style={[styles.desc, { color: color.secondaryText }]}
          >
            {item.description}
          </ThemedText>
        ) : null}
      </View>

      {/* Right section: badge */}
      <View style={styles.right}>
        <View
          style={[
            styles.badge,
            {
              backgroundColor:
                d === 0
                  ? "#f7028e"
                  : d > 0
                  ? color.tertiaryBackground
                  : color.tertiaryBackground,
            },
          ]}
        >
          <ThemedText
            style={[
              styles.badgeText,
              { color: d === 0 ? "#fff" : color.primaryText },
            ]}
          >
            {badgeText}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 12,
  },
  left: { flex: 1, gap: 6, paddingLeft: 2 },
  dateTimeRow: { flexDirection: "row", gap: 8 },
  datePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  dateText: { fontSize: 12, fontWeight: "600" },
  title: { fontSize: 15, fontWeight: "700" },
  desc: { fontSize: 12, lineHeight: 18 },
  right: { marginLeft: 10 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  badgeText: { fontSize: 12, fontWeight: "800" },
});
