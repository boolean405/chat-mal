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
  targetUser,
  isOnline,
  disabled,
  onPress,
  onProfilePress,
  onLongPress,
}: {
  chat: Chat;
  targetUser?: User | null;
  isOnline: boolean;
  disabled: boolean;
  onPress?: () => void;
  onProfilePress?: () => void;
  onLongPress?: () => void;
}) {
  useUiStore((state) => state.timeTick);
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];
  const user = useAuthStore((state) => state.user);

  if (!chat || !user) return null;

  const chatPhoto = getChatPhoto(chat, user._id) ?? "";
  const chatName = chat.name || getChatName(chat, user._id) || "Unknown";

  // Find the current user's unread count from the array
  const currentUserUnread = chat.unreadInfos?.find((uc) => {
    const id = typeof uc.user === "string" ? uc.user : uc.user._id;
    return id === user._id;
  });

  const unreadCount = currentUserUnread?.count ?? 0;

  return (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
    >
      <TouchableOpacity onPress={onProfilePress} disabled={disabled}>
        <ThemedView style={styles.photoContainer}>
          <Image source={{ uri: chatPhoto }} style={styles.photo} />
          {!chat.isGroupChat && isOnline ? (
            <ThemedView
              style={[
                styles.onlineIndicator,
                {
                  borderColor: color.onlineBorder,
                  backgroundColor: color.onlineBackground,
                },
              ]}
            />
          ) : !chat.isGroupChat && !isOnline && targetUser ? (
            <>
              {getLastTime(targetUser.lastOnlineAt) === "0m" ? (
                <ThemedView
                  style={[
                    styles.onlineIndicator,
                    {
                      borderColor: color.secondaryBorder,
                      backgroundColor: color.offlineBackground,
                    },
                  ]}
                />
              ) : (
                <ThemedText
                  style={[
                    styles.lastOnlineText,
                    {
                      color: color.secondaryBackground,
                      backgroundColor: color.offlineBackground,
                    },
                  ]}
                >
                  {getLastTime(targetUser.lastOnlineAt)}
                </ThemedText>
              )}
            </>
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
                    fontWeight: "bold",
                  }
                : {
                    color: "#666",
                  },
            ]}
            numberOfLines={1}
          >
            {chat.latestMessage ? (
              chat.latestMessage.type === "text" ? (
                chat.latestMessage.content
              ) : chat.latestMessage.type === "image" ? (
                <ThemedView
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    alignContent: "center",
                  }}
                >
                  <Image
                    source={{ uri: chat.latestMessage.content }}
                    style={[
                      styles.unreadImage,
                      { borderColor: color.secondaryBorder },
                    ]}
                    contentFit="cover"
                  />
                  <ThemedText
                    style={[
                      styles.unreadText,
                      unreadCount > 0
                        ? {
                            fontWeight: "bold",
                          }
                        : {
                            color: "#666",
                          },
                      {
                        marginLeft: 5,
                      },
                    ]}
                  >
                    Photo
                  </ThemedText>
                </ThemedView>
              ) : chat.latestMessage.type === "video" ? (
                "Video"
              ) : null
            ) : null}
          </ThemedText>
          {unreadCount > 0 && (
            <ThemedView
              style={[
                styles.unreadBadge,
                { backgroundColor: color.unreadBadgeBackground },
              ]}
            >
              <ThemedText type="defaultBold">
                {unreadCount > 99 ? "99+" : unreadCount}
              </ThemedText>
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
    borderRadius: 11,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
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
    borderRadius: 6,
    borderWidth: 2,
    // or use theme background
  },
  lastOnlineText: {
    position: "absolute",
    bottom: 0,
    right: 15,
    width: 14,
    height: 12,
    borderRadius: 6,
    fontWeight: "bold",
    fontSize: 6,
    textAlign: "center",
    textAlignVertical: "center",
    // borderWidth: 1,
  },
  unreadImage: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 0.2,
  },
});
