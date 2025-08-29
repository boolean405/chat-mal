import React from "react";
import {
  FlatList,
  View,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
} from "react-native";

import { Event } from "@/types";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import UpcomingEventItem from "./EventItem";

type Props = {
  events: Event[];
  sort?: "upcoming" | "ended";
  screenType?: "events" | "been-together";
  hasMore?: boolean;
  isPaging?: boolean;
  withinDays?: number;
  hasKeyword?: boolean;
  isLoading?: boolean;

  handleLoadMore?: () => void;
  onPressEvent?: (e: Event) => void;
  onAddPress?: () => void;
  onCalendarPress?: () => void;
  onPressSort?: () => void;
};

export default function EventsList({
  events,
  screenType = "been-together",
  sort = "upcoming",
  hasMore,
  isPaging,
  withinDays,
  hasKeyword,
  isLoading,
  handleLoadMore,
  onPressEvent,
  onAddPress,
  onCalendarPress,
  onPressSort,
}: Props) {
  const scheme = useColorScheme();
  const color = Colors[scheme ?? "light"];

  const renderItem = ({ item }: { item: Event }) => (
    <UpcomingEventItem item={item} onPress={onPressEvent} />
  );

  const emptyText = isLoading
    ? hasKeyword
      ? "Searching…"
      : "Loading events…"
    : hasKeyword
    ? "No events found."
    : "No upcoming events. Tap “Add” to create one.";

  // inside the header
  const title = sort === "upcoming" ? "Upcoming Events" : "Ended Events";

  return (
    <ThemedView style={[styles.container]}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle} numberOfLines={1}>
          {title}
          {sort === "upcoming" && withinDays ? (
            <>
              {" "}
              <ThemedText type="small" style={[{ color: color.secondaryText }]}>
                (within {withinDays} {withinDays === 1 ? "day" : "days"})
              </ThemedText>
            </>
          ) : null}
        </ThemedText>

        {/* Right-side group: calendar + add button */}
        <View style={styles.rightGroup}>
          {/* All events */}
          <TouchableOpacity
            // hitSlop={8}
            onPress={onCalendarPress}
            activeOpacity={0.8}
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
            {screenType === "been-together" && <ThemedText>All</ThemedText>}
          </TouchableOpacity>

          {/* Sort */}
          {screenType === "events" && (
            <TouchableOpacity
              // hitSlop={8}
              onPress={onPressSort}
              activeOpacity={0.8}
              style={[
                styles.iconContainer,
                { backgroundColor: color.secondaryBackground },
              ]}
            >
              <Ionicons
                name="chevron-expand-outline"
                size={18}
                color={color.primaryIcon}
              />
            </TouchableOpacity>
          )}

          {/* Add events */}
          <TouchableOpacity
            accessibilityRole="button"
            onPress={onAddPress}
            hitSlop={8}
            activeOpacity={0.8}
            style={[
              styles.iconContainer,
              { backgroundColor: color.primaryButtonBackground },
            ]}
          >
            <Ionicons
              name="add-outline"
              size={18}
              color={color.primaryBackground}
            />
            {screenType === "been-together" && (
              <ThemedText style={[{ color: color.primaryBackground }]}>
                Add
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={events}
        style={{ flex: 1 }}
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
              {emptyText}
            </ThemedText>
          </ThemedView>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          hasMore && events.length > 0 && isPaging ? (
            <ActivityIndicator size="small" color={color.primaryIcon} />
          ) : null
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
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
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    gap: 2,
  },
});
