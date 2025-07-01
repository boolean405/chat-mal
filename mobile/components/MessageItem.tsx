import React from "react";
import { Image } from "expo-image";
import { StyleSheet, useColorScheme, View } from "react-native";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Message, User } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import formatDate from "@/utils/formatDate";

export default function MessageItem({
  item,
  index,
  messages,
  isTyping = false,
  user,
}: {
  item: Message;
  index: number;
  messages: Message[];
  isTyping?: boolean;
  user: User;
}) {
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];
  const isMe = item.sender._id === user._id;

  // For inverted list, the "last" message is actually at index 0
  const isFirstFromSender =
    !isMe &&
    (index === 0 || messages[index - 1].sender._id !== item.sender._id);

  return (
    <ThemedView
      style={[
        {
          flexDirection: isMe ? "row-reverse" : "row",
          alignItems: "flex-end",
          marginBottom: 5,
        },
      ]}
    >
      {!isMe && (
        <ThemedView style={styles.avatarContainer}>
          {isFirstFromSender ? (
            <Image
              source={{
                uri: item.sender.profilePhoto,
              }}
              style={styles.avatar}
            />
          ) : (
            <ThemedView style={styles.avatarPlaceholder} />
          )}
        </ThemedView>
      )}

      <ThemedView
        style={[
          styles.messageContainer,
          isMe
            ? [styles.myMessage, { backgroundColor: color.main }]
            : [styles.otherMessage, { backgroundColor: color.secondary }],
          isTyping && styles.typingMessageContainer,
        ]}
      >
        <ThemedText style={isTyping ? styles.typingText : styles.contentText}>
          {isTyping ? "Typing..." : item.content}
        </ThemedText>

        {!isTyping && (
          <View style={styles.timeStatusContainer}>
            <ThemedText type="small" style={styles.timeText}>
              {formatDate(item.createdAt)}
            </ThemedText>
            {isMe && (
              <Ionicons
                name={
                  item.status === "seen"
                    ? "checkmark-done"
                    : item.status === "delivered"
                    ? "checkmark-done-outline"
                    : "checkmark-outline"
                }
                size={14}
                color={item.status === "seen" ? "#34B7F1" : "#888"}
                style={{ marginLeft: 5 }}
              />
            )}
          </View>
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    maxWidth: "75%",
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
  },
  myMessage: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 0, // Pointy edge for my messages
  },
  otherMessage: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 0, // Pointy edge for other messages
  },
  timeText: {
    color: "#888",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  avatarContainer: {
    width: 28,
    height: 28,
    marginRight: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  avatarPlaceholder: {
    width: 28,
    height: 28,
  },
  typingMessageContainer: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginVertical: 0,
  },
  typingText: {
    fontStyle: "italic",
    fontSize: 13,
    color: "#888",
  },
  timeStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  contentText: {
    lineHeight: 25,
  },
});

// export default React.memo(MessageItem, (prevProps, nextProps) => {
//   return (
//     prevProps.item._id === nextProps.item._id &&
//     prevProps.isTyping === nextProps.isTyping &&
//     prevProps.item.status === nextProps.item.status
//   );
// });
