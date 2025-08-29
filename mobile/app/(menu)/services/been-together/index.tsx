// app/been-together.tsx
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, useColorScheme, ScrollView, Alert } from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import DaysTogetherPill from "@/components/been-together/DaysTogetherPill";
import UserAvatarCard from "@/components/been-together/UserAvatarCard";
import ScreenHeader from "@/components/ScreenHeader";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import UpcomingEventsList from "@/components/event/EventsList";
import EditRelationshipModal from "@/components/been-together/EditRelationshipModal";
import { useAuthStore } from "@/stores/authStore";
import { Event, User } from "@/types";
import SelectUserModal from "@/components/been-together/SelectUserModal";
import { useBeenTogetherStore } from "@/stores/beenTogetherStore";
import { toDate } from "@/utils/dates";
import { format } from "date-fns";
import { useNetworkStore } from "@/stores/useNetworkStore";
import { createEvent } from "@/api/event";
import AddEventModal from "@/components/event/AddEventModal";
import { useEventStore } from "@/stores/eventStore";
import { useRouter } from "expo-router";

export default function BeenTogether() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];

  const user = useAuthStore((s) => s.user);
  const networkInfo = useNetworkStore((state) => state.networkInfo);

  const {
    title,
    partner,
    isLoading,
    lovedAt,
    eventsDayCount,
    fetchData,
    updateData,
  } = useBeenTogetherStore();

  const {
    events,
    hasMore,
    isPaging,
    isLoading: isLoadingEvents,
    fetchEvents,
    createEvent,
    setWithinDays,
  } = useEventStore();

  // normalize store date once for this render
  const startDateSafe = useMemo(() => toDate(lovedAt), [lovedAt]);

  // Unmount
  useEffect(() => {
    setWithinDays(eventsDayCount);
    return () => {
      setWithinDays(0);
    };
  }, [eventsDayCount, setWithinDays]);

  // Fetch beentogether
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch upcoming events
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents, eventsDayCount]);

  const handleLoadMore = async () => {
    if (hasMore && !isPaging && !isLoading) {
      await fetchEvents(true);
    }
  };

  const [titleDraft, setTitleDraft] = useState(title);
  const [lovedAtDraft, setLovedAtDraft] = useState<Date>(startDateSafe);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [eventsDayCountDraft, setEventsDayCountDraft] =
    useState(eventsDayCount);

  const [showEditRelationshipModal, setShowEditRelationshipModal] =
    useState(false);
  const [showSelectUserModal, setShowSelectUserModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);

  // keep drafts in sync when store changes (e.g., after API load)
  useEffect(() => {
    setTitleDraft(title);
    setLovedAtDraft(startDateSafe);
    setEventsDayCountDraft(eventsDayCount);
  }, [title, startDateSafe, eventsDayCount]);

  const openEditor = () => {
    setTitleDraft(title);
    setLovedAtDraft(startDateSafe); // ensure Date
    setEventsDayCountDraft(eventsDayCount);
    setShowEditRelationshipModal(true);
  };

  // Handle select partner
  const handleSelectedPartner = (partner: User) => {
    if (!networkInfo?.isConnected) {
      Alert.alert(
        "No internet connection",
        "Please check your internet connection and try again."
      );
      return;
    }

    updateData({ partner });
    setShowSelectUserModal(false);
  };

  // Handle remove partner
  const handleRemovePartner = () => {
    updateData({ partner: null });
  };

  // Handle save data
  const handleSaveData = () => {
    if (!networkInfo?.isConnected) {
      Alert.alert(
        "No internet connection",
        "Please check your internet connection and try again."
      );
      return;
    }

    const nextTitle = titleDraft.trim();
    updateData({
      title: nextTitle,
      lovedAt: lovedAtDraft,
      eventsDayCount: eventsDayCountDraft,
    });
    setWithinDays(eventsDayCountDraft);
    setShowEditRelationshipModal(false);
  };

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (event.type === "set" && selectedDate) {
      setLovedAtDraft(selectedDate);
    }
  };

  const isUnchanged =
    titleDraft === title &&
    lovedAtDraft.getTime() === startDateSafe.getTime() &&
    eventsDayCountDraft === eventsDayCount;

  if (!user) return null;

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
      <ScreenHeader title="Been Together" />

      <ThemedView style={{ paddingHorizontal: 20, marginBottom: 50 }}>
        <DaysTogetherPill
          startDateISO={format(startDateSafe, "yyyy-MM-dd")}
          title={title}
          onEdit={openEditor}
        />

        {/* User */}
        <ThemedView style={styles.row}>
          <ThemedView style={styles.sideCol}>
            <UserAvatarCard user={user} disabled={true} />
          </ThemedView>

          <ThemedView style={styles.centerCol}>
            <Ionicons name="heart" size={52} color={"#f7028e"} />
          </ThemedView>

          {/* Partner */}
          <ThemedView style={styles.sideCol}>
            <UserAvatarCard
              user={partner ? partner : undefined}
              disabled={isLoading}
              onPress={() => setShowSelectUserModal(true)}
            />
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <UpcomingEventsList
        events={events}
        onPressEvent={(event) => console.log("Pressed event:", event._id)}
        onAddPress={() => setShowAddEventModal(true)}
        onCalendarPress={() =>
          router.push({
            pathname: "/(menu)/services/events" as any,
          })
        }
        handleLoadMore={handleLoadMore}
        hasMore={hasMore}
        isPaging={isPaging}
        withinDays={eventsDayCount}
      />

      <EditRelationshipModal
        visible={showEditRelationshipModal}
        titleDraft={titleDraft}
        onChangeTitle={setTitleDraft}
        lovedAtDraft={lovedAtDraft}
        onPressPickDate={() => setShowDatePicker(true)}
        eventsDayCountDraft={eventsDayCountDraft}
        onDecWithin={() => setEventsDayCountDraft((d) => Math.max(1, d - 1))}
        onIncWithin={() => setEventsDayCountDraft((d) => Math.min(30, d + 1))}
        isUnchanged={isUnchanged}
        onCancel={() => {
          setTitleDraft(title);
          setLovedAtDraft(startDateSafe);
          setEventsDayCountDraft(eventsDayCount);
          setShowEditRelationshipModal(false);
        }}
        isLoading={isLoading}
        onSave={handleSaveData}
        partner={partner}
        onPressPartner={() => {
          if (partner) handleRemovePartner();
          else setShowSelectUserModal(true);
        }}
      />

      {/* System date picker for Start Loved At */}
      {showDatePicker && (
        <DateTimePicker
          value={lovedAtDraft}
          mode="date"
          display="default"
          onChange={onChangeDate}
          maximumDate={new Date()}
        />
      )}

      {/* Partner selection */}
      <SelectUserModal
        visible={showSelectUserModal}
        onClose={() => setShowSelectUserModal(false)}
        currentUserId={user._id}
        onSelect={(partner) => handleSelectedPartner(partner)}
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
  row: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 12,
  },
  sideCol: {
    flexGrow: 1,
    flexBasis: 0,
    alignItems: "center",
  },
  centerCol: {
    width: 80,
    alignItems: "center",
    justifyContent: "center",
  },
});
