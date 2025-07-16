import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  useColorScheme,
} from "react-native";

import { Chat, Message, User } from "@/types";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import MessageItem from "@/components/MessageItem";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { getChatPhoto } from "@/utils/getChatPhoto";
import { getChatName } from "@/utils/getChatName";
import usePaginatedData from "@/hooks/usePaginateData";
import { createMessage, getPaginateMessages } from "@/api/message";
import { useMessageStore } from "@/stores/messageStore";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";
import { acceptChatRequest, deleteChat, readChat } from "@/api/chat";
import getLastTime from "@/utils/getLastTime";
import { socket } from "@/config/socket";
import useTimeTickWhenFocused from "@/hooks/useTimeTickWhenFocused";
import { useUiStore } from "@/stores/uiStore";

export default function ChatMessage() {
  useTimeTickWhenFocused();
  useUiStore((state) => state.timeTick);

  const router = useRouter();
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];
  const flatListRef = useRef<FlatList>(null);

  const user = useAuthStore((state) => state.user);
  const { chatId: rawChatId } = useLocalSearchParams();
  const chatId = Array.isArray(rawChatId) ? rawChatId[0] : rawChatId;
  // Get chat and messages from stores
  const {
    currentChat,
    onlineUserIds,
    getChatById,
    setCurrentChat,
    updateChat,
    clearChat,
  } = useChatStore();

  const {
    messages: storedMessages,
    addMessage,
    prependMessages,
    setMessages,
    markMessagesAsSeen,
  } = useMessageStore();

  // Get messages for current chat from store
  const currentMessagesRaw = chatId ? storedMessages[chatId] || [] : [];
  const currentMessages = Array.from(
    new Map(currentMessagesRaw.map((msg) => [msg._id, msg])).values()
  );

  const [newMessage, setNewMessage] = useState("");
  const [isSentMessage, setIsSentMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<User | null>(null);

  // Pagination handling
  const {
    isLoading: loading,
    isRefreshing,
    isPaging,
    hasMore,
    refresh,
    loadMore,
  } = usePaginatedData<Message>({
    fetchData: async (page: number) => {
      if (!chatId) return { items: [], totalPage: 0 };
      const data = await getPaginateMessages(chatId, page);
      // Store the messages in Zustand
      if (page === 1) {
        setMessages(chatId, data.result.messages);
      } else {
        prependMessages(chatId, data.result.messages);
      }
      return {
        items: data.result.messages,
        totalPage: data.result.totalPage,
      };
    },
  });

  // Listening socket
  useEffect(() => {
    if (!socket || !chatId || !user) return;

    socket.emit("join-chat", chatId);

    const handleReceiveMessage = async ({ message }: { message: Message }) => {
      if (message.chat._id === chatId) {
        addMessage(chatId, message);
        const data = await readChat(chatId);
        updateChat(data.result);
      }
    };

    const handleTyping = ({
      chatId: typingChatId,
      user: typingUserData,
    }: {
      chatId: string;
      user: User;
    }) => {
      if (typingChatId === chatId && typingUserData._id !== user._id) {
        setIsTyping(true);
        setTypingUser(typingUserData);
      }
    };

    const handleStopTyping = ({
      chatId: stopTypingChatId,
    }: {
      chatId: string;
    }) => {
      if (stopTypingChatId === chatId) {
        setIsTyping(false);
        setTypingUser(null);
      }
    };

    const handleChatRead = ({
      chatId,
      userId,
    }: {
      chatId: string;
      userId: string;
    }) => {
      markMessagesAsSeen(chatId, userId);
    };

    socket.on("typing", handleTyping);
    socket.on("chat-read", handleChatRead);
    socket.on("stop-typing", handleStopTyping);
    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("chat-read", handleChatRead);
      socket.off("stop-typing", handleStopTyping);
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [socket, chatId, user]);

  // Emiting socket
  useEffect(() => {
    if (!socket || !chatId || !user) return;

    if (newMessage.trim().length > 0) {
      socket.emit("typing", { chatId, user });
    } else {
      socket.emit("stop-typing", { chatId, user });
    }
  }, [newMessage]);

  // Set current chat when screen mounts
  useEffect(() => {
    if (chatId) {
      const chat = getChatById(chatId);
      if (chat) {
        setCurrentChat(chat);
      } else {
        setCurrentChat(null);
      }
    }

    return () => {
      setCurrentChat(null);
    };
  }, [chatId]);

  useEffect(() => {
    if (isSentMessage && currentMessages.length > 0) {
      flatListRef.current?.scrollToIndex({ index: 0, animated: true });
      setIsSentMessage(false); // Reset the flag
    }
  }, [currentMessages, isSentMessage]);

  if (!user || !currentChat) return null;

  const chatPhoto = getChatPhoto(currentChat, user._id);
  const chatName = currentChat.name || getChatName(currentChat, user._id);

  const initiator = currentChat.initiator._id || currentChat.initiator;
  const isPendingChat = currentChat.isPending && initiator !== user._id;

  // Handle send message
  const handleSendMessage = async () => {
    setIsSentMessage(true);

    // Create tmp message
    if (!newMessage.trim() || !chatId || !currentChat) return;
    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      _id: tempId,
      content: newMessage.trim(),
      sender: user,
      chat: currentChat,
      type: "text",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    addMessage(chatId, tempMessage);
    setNewMessage("");
    socket.emit("stop-typing", { chatId });

    // Call api message
    try {
      const data = await createMessage(chatId, newMessage.trim());
      const message = data.result;

      // Replace temp message with the real one
      setMessages(chatId, [
        message,
        ...currentMessages.filter((msg) => msg._id !== tempId),
      ]);
      updateChat(message.chat);
    } catch (error: any) {
      // Update the temp message status to 'failed'
      setMessages(
        chatId,
        currentMessages.map((msg) => {
          if (msg._id === tempId) {
            return { ...msg, status: "failed" };
          }
          return msg;
        })
      );
      ToastAndroid.show(error.message, ToastAndroid.SHORT);
    }
  };

  // Handle request chat
  const handleAccept = async () => {
    setIsLoading(true);
    try {
      const data = await acceptChatRequest(chatId);
      if (data.status) updateChat(data.result);
    } catch (error: any) {
      ToastAndroid.show(error.message, ToastAndroid.SHORT);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete chat
  const handleDelete = () => {
    Alert.alert("Delete Chat", "Are you sure you want to delete this chat?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          // Call async logic but don't make onPress async
          setIsLoading(true);
          try {
            const data = await deleteChat(chatId);
            ToastAndroid.show(data.message, ToastAndroid.SHORT);
            clearChat(chatId);
            router.back();
          } catch (error: any) {
            ToastAndroid.show(error.message, ToastAndroid.SHORT);
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  const otherUser = currentChat.users?.find(
    (u) => u.user._id !== user._id
  )?.user;

  const isOnline =
    otherUser && onlineUserIds.includes(otherUser?._id) ? true : false;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: color.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      {/* Header */}
      <ThemedView style={[styles.header, { borderBottomColor: color.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={22} color={color.icon} />
        </TouchableOpacity>

        {/* Profile avatar */}
        <TouchableOpacity onPress={() => console.log("Profile")}>
          <ThemedView style={styles.profilePhotoContainer}>
            <Image source={{ uri: chatPhoto }} style={styles.profilePhoto} />
            {!currentChat.isGroupChat && isOnline ? (
              <ThemedView
                style={[
                  styles.onlineIndicator,
                  { borderColor: color.secondary },
                ]}
              />
            ) : !currentChat.isGroupChat ? (
              <ThemedText type="smallest" style={styles.lastOnlineText}>
                {otherUser && getLastTime(otherUser.lastOnlineAt)}
              </ThemedText>
            ) : null}
          </ThemedView>
        </TouchableOpacity>
        <ThemedText type="larger" style={styles.chatName} numberOfLines={1}>
          {chatName}
        </ThemedText>
        {/* Header icons */}
        {!isPendingChat ? (
          <ThemedView style={styles.headerIcons}>
            <TouchableOpacity onPress={() => console.log("Voice call")}>
              <Ionicons
                name="call-outline"
                size={22}
                style={styles.icon}
                color={color.icon}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => console.log("Video call")}>
              <Ionicons
                name="videocam-outline"
                size={22}
                style={styles.icon}
                color={color.icon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/(chat)/detail",
                  params: { chatId },
                })
              }
            >
              <Ionicons
                name="ellipsis-vertical-outline"
                size={22}
                style={styles.icon}
                color={color.icon}
              />
            </TouchableOpacity>
          </ThemedView>
        ) : null}
      </ThemedView>

      {/* Messages */}
      <FlatList
        keyboardShouldPersistTaps="handled"
        ref={flatListRef}
        data={currentMessages}
        style={styles.chatList}
        contentContainerStyle={{ padding: 10 }}
        showsVerticalScrollIndicator={false}
        refreshing={isRefreshing}
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        inverted={true}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => (
          <MessageItem
            item={item}
            index={index}
            messages={currentMessages}
            user={user}
          />
        )}
        ListFooterComponent={
          hasMore && isPaging ? (
            <ActivityIndicator size="small" color={color.icon} />
          ) : null
        }
      />
      {isTyping && typingUser && (
        <ThemedView style={styles.typingIndicatorContainer}>
          <Image
            source={{ uri: typingUser.profilePhoto }}
            style={styles.typingAvatar}
          />
          <ThemedText type="small" style={{ fontStyle: "italic" }}>
            Typing...
          </ThemedText>
        </ThemedView>
      )}

      {/* Input Area and requset icon*/}
      {isPendingChat ? (
        <ThemedView style={styles.pendingButtonContainer}>
          <TouchableOpacity
            disabled={isLoading}
            style={[styles.pendingButton, { backgroundColor: color.secondary }]}
            onPress={() => console.log("Block User")}
          >
            <ThemedText type="defaultBold" style={styles.blockText}>
              Block
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={isLoading}
            style={[styles.pendingButton, { backgroundColor: color.secondary }]}
            onPress={handleDelete}
          >
            <ThemedText type="defaultBold" style={styles.deleteText}>
              Delete
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={isLoading}
            style={[styles.pendingButton, { backgroundColor: color.secondary }]}
            onPress={handleAccept}
          >
            <ThemedText type="defaultBold" style={styles.acceptText}>
              Accept
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      ) : (
        // Input container
        <ThemedView style={[styles.inputContainer]}>
          <ThemedView
            style={[
              styles.inputTextContainer,
              { backgroundColor: color.secondary },
            ]}
          >
            <TouchableOpacity style={styles.imageButton}>
              <Ionicons
                name="add-circle-outline"
                size={22}
                color={color.icon}
              />
            </TouchableOpacity>
            <TextInput
              value={newMessage}
              onChangeText={setNewMessage}
              style={[styles.textInput, { color: color.text }]}
              placeholder="Type a message"
              placeholderTextColor="gray"
              multiline
            />
            <TouchableOpacity
              onPress={() => console.log("image")}
              style={styles.imageButton}
            >
              <Ionicons name="image-outline" size={22} color={color.icon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.imageButton}>
              <Ionicons name="camera-outline" size={22} color={color.icon} />
            </TouchableOpacity>
          </ThemedView>
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: color.messageBackground },
            ]}
            onPress={handleSendMessage}
          >
            <Ionicons name="send-outline" size={22} color={color.icon} />
          </TouchableOpacity>
        </ThemedView>
      )}
    </KeyboardAvoidingView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    // paddingRight: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 0.4,
  },
  chatName: { flex: 1, marginLeft: 10 },
  headerIcons: { flexDirection: "row" },
  icon: { marginLeft: 15 },

  chatList: { flex: 1 },

  inputContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",

    paddingBottom: 35,
    paddingTop: 5,
  },
  inputTextContainer: {
    height: 40,
    width: "80%",
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
  },
  sendButton: {
    backgroundColor: "#128c7e",
    padding: 10,
    borderRadius: 20,
  },
  imageButton: {
    paddingHorizontal: 5,
  },
  typingIndicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
  },

  senderProfileBubble: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ccc", // Or avatar placeholder color
    marginRight: 8,
  },
  // chatPhoto: {
  //   width: 40,
  //   height: 40,
  //   borderRadius: 20,
  //   backgroundColor: "#ccc", // Or avatar placeholder color
  //   marginLeft: 10,
  // },

  pendingButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    padding: 10,
  },
  pendingButton: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: "center",
  },
  acceptText: {
    color: "green",
  },
  deleteText: {
    color: "gray",
  },
  blockText: {
    color: "red",
  },
  typingAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },

  profilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    // marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  dateContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    // alignContent: "center",
    alignItems: "center",
  },
  profilePhotoContainer: {
    position: "relative",
    marginLeft: 10,
  },

  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "limegreen",
    borderWidth: 1,
  },
  lastOnlineText: {
    position: "absolute",
    bottom: 0,
    right: 0,
    color: "gray",
    fontWeight: "bold",
  },
});
