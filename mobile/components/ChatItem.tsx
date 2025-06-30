import React from "react";
import { Image } from "expo-image";
import { TouchableOpacity, StyleSheet, useColorScheme } from "react-native";

import { Chat } from "@/types";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import formatDate from "@/utils/formatDate";
import { Colors } from "@/constants/colors";
import { getChatPhoto } from "@/utils/getChatPhoto";
import { getChatName } from "@/utils/getChatName";
import { useAuthStore } from "@/stores/authStore";

export default function ChatItem({
  chat,
  onPress,
  onProfilePress,
  onLongPress,
}: {
  chat: Chat;
  onPress?: () => void;
  onProfilePress?: () => void;
  onLongPress?: () => void;
}) {
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];
  const user = useAuthStore((state) => state.user);
  if (!user) return null;
  const chatPhoto = getChatPhoto(chat, user._id) ?? "";
  const chatName = chat.name || getChatName(chat, user._id) || "Unknown";

  return (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <TouchableOpacity onPress={onProfilePress}>
        <Image
          source={{
            uri: chatPhoto,
          }}
          style={styles.photo}
        />
      </TouchableOpacity>
      <ThemedView style={styles.chatContent}>
        <ThemedView style={styles.chatTopRow}>
          <ThemedText type="defaultBold">{chatName}</ThemedText>
          <ThemedText type="small" style={{ color: "#999" }}>
            {formatDate(chat.updatedAt)}
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.chatBottomRow}>
          <ThemedText
            style={[
              {
                color: "#666",
                flex: 1,
              },
              chat.unreadCount > 0 && {
                fontWeight: "bold",
                color: color.primary,
              },
            ]}
            numberOfLines={1}
          >
            {chat.latestMessage?.content}
          </ThemedText>
          {true && (
            <ThemedView
              style={[styles.unreadBadge, { backgroundColor: color.secondary }]}
            >
              <ThemedText type="defaultBold">{chat.unreadCount}</ThemedText>
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
    backgroundColor: "#ccc",
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
    fontWeight: "bold",
    color: "#000",
  },
  unreadBadge: {
    // backgroundColor: "#25D366",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    marginLeft: 8,
  },
});
