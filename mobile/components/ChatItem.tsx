import React from "react";
import { Image } from "expo-image";
import { TouchableOpacity, StyleSheet, useColorScheme } from "react-native";

import { Chat, User } from "@/types";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import formatDate from "@/utils/formatDate";
import { Colors } from "@/constants/colors";
import { getChatPhoto } from "@/utils/getChatPhoto";
import { getChatName } from "@/utils/getChatName";
import getLastTime from "@/utils/getLastTime";
import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";

export default function ChatItem({
  chat,
  otherUser,
  isOnline,
  onPress,
  onProfilePress,
  onLongPress,
}: {
  chat: Chat;
  otherUser?: User;
  isOnline: boolean;
  onPress?: () => void;
  onProfilePress?: () => void;
  onLongPress?: () => void;
}) {
  useUiStore((state) => state.timeTick);
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];
  const user = useAuthStore((state) => state.user);

  if (!chat || !user || !otherUser) return null;

  const chatPhoto = getChatPhoto(chat, user._id) ?? "";
  const chatName = chat.name || getChatName(chat, user._id) || "Unknown";

  // Find the current user's unread count from the array
  const currentUserUnread = chat.unreadInfos?.find(
    (uc) => uc.user._id === user._id || uc.user?._id === user._id
  );
  const unreadCount = currentUserUnread?.count ?? 0;

  return (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <TouchableOpacity onPress={onProfilePress}>
        <ThemedView style={styles.photoContainer}>
          <Image source={{ uri: chatPhoto }} style={styles.photo} />
          {!chat.isGroupChat && isOnline ? (
            <ThemedView
              style={[styles.onlineIndicator, { borderColor: color.secondary }]}
            />
          ) : !chat.isGroupChat ? (
            <ThemedText type="smaller" style={styles.lastOnlineText}>
              {getLastTime(otherUser.lastOnlineAt || otherUser.updatedAt)}
            </ThemedText>
          ) : null}
        </ThemedView>
      </TouchableOpacity>

      {/* Chat content */}
      <ThemedView style={styles.chatContent}>
        <ThemedView style={styles.chatTopRow}>
          <ThemedText
            type="defaultBold"
            style={{ flex: 1, marginRight: 15 }}
            numberOfLines={1}
          >
            {chatName}
          </ThemedText>
          <ThemedText type="small" style={{ color: "#999" }}>
            {formatDate(chat.updatedAt)}
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.chatBottomRow}>
          <ThemedText
            style={[
              styles.unreadText,
              unreadCount > 0
                ? {
                    fontWeight: "semibold",
                  }
                : {
                    color: "#666",
                  },
            ]}
            numberOfLines={1}
          >
            {chat.latestMessage?.content}
          </ThemedText>
          {unreadCount > 0 && (
            <ThemedView
              style={[styles.unreadBadge, { backgroundColor: color.secondary }]}
            >
              <ThemedText type="defaultBold">{unreadCount}</ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    // padding: 12,
  },
  photo: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 12,
    backgroundColor: "#e9e9e9",
  },
  chatContent: {
    flex: 1,
    borderBottomColor: "#eee",
  },
  chatTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  chatBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  unreadText: {
    flex: 1,
    // color: "#666",
    lineHeight: 25,
  },
  unreadBadge: {
    // backgroundColor: "#25D366",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    marginLeft: 50,
  },
  photoContainer: {
    position: "relative",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 15,
    width: 12,
    height: 12,
    backgroundColor: "limegreen",
    borderRadius: 6,
    borderWidth: 2,
    // or use theme background
  },
  lastOnlineText: {
    position: "absolute",
    bottom: 0,
    right: 15,
    color: "gray",
    fontWeight: "bold",
  },
});
