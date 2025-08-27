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
import { Event } from "@/types";
import {
  formatEventDateParts,
  daysUntil,
  formatRelativeBadge,
} from "@/utils/dates";

type Props = {
  item: Event;
  onPress?: (e: Event) => void;
};

export default function EventItem({ item, onPress }: Props) {
  const scheme = useColorScheme();
  const color = Colors[scheme ?? "light"];

  const d = daysUntil(item.startAt);
  const badgeText = formatRelativeBadge(item.startAt);
  const isEnded = new Date(item.startAt).getTime() < Date.now();

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
              size={12}
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
              size={12}
              color={color.tertiaryIcon}
            />
            <ThemedText
              style={[styles.dateText, { color: color.tertiaryText }]}
            >
              {time}
            </ThemedText>
          </View>

          {/* Event status */}
          <View
            style={[
              styles.datePill,
              { backgroundColor: color.tertiaryBackground },
            ]}
          >
            <Ionicons
              name="radio-button-on-outline"
              size={12}
              color={isEnded ? "red" : "limegreen"}
            />
            <ThemedText
              style={[
                styles.dateText,
                { color: isEnded ? "red" : "limegreen" },
              ]}
            >
              {isEnded ? "Ended" : "Upcoming"}
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
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  dateText: { fontSize: 10, fontWeight: "600" },
  title: { fontSize: 15, fontWeight: "700", lineHeight: 22 },
  desc: { fontSize: 12, lineHeight: 18 },
  right: { marginLeft: 10 },
  badge: { borderRadius: 10, paddingHorizontal: 6, paddingVertical: 4 },
  badgeText: { fontSize: 10, fontWeight: "800" },
});
