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
import { UPCOMING_EVENTS } from "@/constants/data";
import UpcomingEventsList from "@/components/been-together/UpcomingEventsList";
import EditRelationshipModal from "@/components/been-together/EditRelationshipModal";
import { useAuthStore } from "@/stores/authStore";
import { User } from "@/types";
import SelectUserModal from "@/components/been-together/SelectUserModal";
import { useBeenTogetherStore } from "@/stores/beenTogetherStore";
import { toDate } from "@/utils/dates";
import { format } from "date-fns";
import { useNetworkStore } from "@/stores/useNetworkStore";

export default function BeenTogether() {
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

  // normalize store date once for this render
  const startDateSafe = useMemo(() => toDate(lovedAt), [lovedAt]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const [titleDraft, setTitleDraft] = useState(title);
  const [isEditing, setIsEditing] = useState(false);
  const [lovedAtDraft, setLovedAtDraft] = useState<Date>(startDateSafe);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [events, setEvents] = useState(UPCOMING_EVENTS);
  const [eventsDayCountDraft, setEventsDayCountDraft] =
    useState(eventsDayCount);

  const [showSelectUserModal, setShowSelectUserModal] = useState(false);

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
    setIsEditing(true);
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
    setIsEditing(false);
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

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScreenHeader title="Been Together" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <ThemedView style={{ paddingHorizontal: 20 }}>
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
          eventsDayCount={eventsDayCount}
          onPressEvent={(event) => console.log("Pressed event:", event._id)}
          onAddPress={() => console.log("Add event")}
          onAllEventsPress={() => console.log("All events")}
        />
      </ScrollView>

      <EditRelationshipModal
        visible={isEditing}
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
          setIsEditing(false);
        }}
        isLoading={isLoading}
        onSave={handleSaveData}
        partner={partner}
        onPressPartner={() => {
          if (partner) handleRemovePartner();
          else setShowSelectUserModal(true);
        }}
      />

      {showDatePicker && (
        <DateTimePicker
          value={lovedAtDraft}
          mode="date"
          display="default"
          onChange={onChangeDate}
          maximumDate={new Date()}
        />
      )}

      <SelectUserModal
        visible={showSelectUserModal}
        onClose={() => setShowSelectUserModal(false)}
        currentUserId={user._id}
        onSelect={(partner) => handleSelectedPartner(partner)}
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
  // Equal-width columns, regardless of inner content width
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
