import React from "react";
import {
  FlatList,
  View,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native";

import { UpcomingEvent } from "@/types";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import UpcomingEventItem from "./UpcomingEventItem";

type Props = {
  events: UpcomingEvent[];
  eventsDayCount?: number;
  onPressEvent?: (e: UpcomingEvent) => void;
  onAddPress?: () => void;
  onAllEventsPress?: () => void;
};

export default function UpcomingEventsList({
  events,
  eventsDayCount = 5,
  onPressEvent,
  onAddPress,
  onAllEventsPress,
}: Props) {
  const scheme = useColorScheme();
  const color = Colors[scheme ?? "light"];

  // For upcoming events only
  const now = new Date();
  const fiveDaysLater = new Date();
  fiveDaysLater.setDate(now.getDate() + eventsDayCount);

  const upcomingEvents = events
    .filter((e) => {
      const eventDate = new Date(e.startAt);
      return eventDate >= now && eventDate <= fiveDaysLater;
    })
    .sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    );

  const renderItem = ({ item }: { item: UpcomingEvent }) => (
    <UpcomingEventItem item={item} onPress={onPressEvent} />
  );

  return (
    <ThemedView style={[styles.container]}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Upcoming Events</ThemedText>
        {/* Right-side group: calendar + add button */}
        <View style={styles.rightGroup}>
          {/* All events */}
          <TouchableOpacity
            // hitSlop={8}
            onPress={onAllEventsPress}
            activeOpacity={0.7}
            style={[
              styles.iconContainer,
              { backgroundColor: color.secondaryBackground },
            ]}
          >
            <Ionicons
              name="calendar-outline"
              size={18}
              color={color.primaryIcon}
            />
            <ThemedText style={[styles.addText]}>All</ThemedText>
          </TouchableOpacity>

          {/* Add events */}
          <TouchableOpacity
            accessibilityRole="button"
            onPress={onAddPress}
            hitSlop={8}
            activeOpacity={0.7}
            style={[
              styles.addBtn,
              { backgroundColor: color.primaryButtonBackground },
            ]}
          >
            <Ionicons
              name="add-outline"
              size={18}
              color={color.primaryBackground}
            />
            <ThemedText
              style={[styles.addText, { color: color.primaryBackground }]}
            >
              Add
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={upcomingEvents}
        keyExtractor={(e) => e._id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <ThemedView style={styles.empty}>
            <Ionicons
              name="sparkles-outline"
              size={18}
              color={color.secondaryText}
            />
            <ThemedText
              style={[styles.emptyText, { color: color.secondaryText }]}
            >
              No upcoming events. Tap “Add” to create one.
            </ThemedText>
          </ThemedView>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        scrollEnabled={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    marginHorizontal: 20,
    borderRadius: 16,
    // padding: 12,
  },
  addText: { fontWeight: "600" },
  empty: { alignItems: "center", gap: 8, paddingVertical: 16 },
  emptyText: { fontSize: 13 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  headerTitle: { fontSize: 16, fontWeight: "700" },
  rightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 5,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 5,
  },
});
