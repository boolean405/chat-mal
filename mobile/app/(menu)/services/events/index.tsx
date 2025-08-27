// app/been-together.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  useColorScheme,
  Alert,
  TextInput,
  TouchableOpacity,
} from "react-native";
import ScreenHeader from "@/components/ScreenHeader";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/colors";
import UpcomingEventsList from "@/components/event/EventsList";
import { useAuthStore } from "@/stores/authStore";
import { useNetworkStore } from "@/stores/useNetworkStore";
import AddEventModal from "@/components/event/AddEventModal";
import { useEventStore } from "@/stores/eventStore";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import useDebounce from "@/hooks/useDebounce";

export default function BeenTogether() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];

  const user = useAuthStore((s) => s.user);
  const networkInfo = useNetworkStore((state) => state.networkInfo);

  const inputRef = useRef<TextInput>(null);

  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);

  // Pagination
  const {
    events,
    keyword,
    sort,
    hasMore,
    isPaging,
    isLoading,
    setSort,
    createEvent,
    fetchEvents,
    setKeyword,
  } = useEventStore();

  const debouncedKeyword = useDebounce(keyword, 200);

  // Unmount
  useEffect(() => {
    return () => {
      setKeyword("");
      setSort("upcoming");
    };
  }, [setKeyword, setSort]);

  useEffect(() => {
    fetchEvents(false);
  }, [debouncedKeyword, sort, fetchEvents]);

  const handleLoadMore = async () => {
    if (hasMore && !isPaging && !isLoading) {
      await fetchEvents(true);
    }
  };

  // Clear input
  const handleClear = () => {
    setKeyword("");
    inputRef.current?.focus();
  };

  // For events
  const handleSubmitNewEvent = async (payload: {
    title: string;
    startAt: Date;
    description?: string;
  }) => {
    if (!networkInfo?.isConnected) {
      Alert.alert(
        "No internet connection",
        "Please check your internet connection and try again."
      );
      return;
    }
    try {
      createEvent(payload);
      setIsSubmittingEvent(true);
      setShowAddEventModal(false);
    } catch (e: any) {
      Alert.alert("Create event failed", e?.message);
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScreenHeader title="Events" />

      {/* Search Input */}
      <ThemedView style={styles.headerInputContainer}>
        <ThemedView style={styles.inputContainer}>
          <ThemedView
            style={[
              styles.inputTextContainer,
              { backgroundColor: color.secondaryBackground },
            ]}
          >
            <Ionicons
              name="search-outline"
              size={22}
              color={color.primaryIcon}
            />
            <TextInput
              ref={inputRef}
              value={keyword}
              onChangeText={setKeyword}
              placeholder="Search events"
              placeholderTextColor="gray"
              style={[styles.textInput, { color: color.primaryText }]}
            />
            {keyword.length > 0 && (
              <TouchableOpacity onPress={handleClear}>
                <Ionicons
                  name="close-circle-outline"
                  size={18}
                  color={color.primaryIcon}
                />
              </TouchableOpacity>
            )}
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <UpcomingEventsList
        screenType="events"
        sort={sort}
        events={events}
        onPressEvent={(event) => console.log("Pressed event:", event._id)}
        onAddPress={() => setShowAddEventModal(true)}
        onCalendarPress={() => console.log("open calendar")}
        handleLoadMore={handleLoadMore}
        isPaging={isPaging}
        onPressSort={() => {
          setSort(sort === "upcoming" ? "ended" : "upcoming");
        }}
      />

      {/* NEW: Add Event modal */}
      <AddEventModal
        visible={showAddEventModal}
        isSubmitting={isSubmittingEvent}
        onClose={() => setShowAddEventModal(false)}
        onSubmit={handleSubmitNewEvent}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerInputContainer: {
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  inputTextContainer: {
    height: 40,
    width: "95%",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  textInput: {
    flex: 1,
    paddingBottom: 0,
    paddingTop: 0,
    height: "100%",
    paddingLeft: 20,
  },
});
