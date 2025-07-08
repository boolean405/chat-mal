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
import { acceptChatRequest, deleteChat } from "@/api/chat";
import { getSocket } from "@/config/socket";

export default function ChatMessage() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];
  const flatListRef = useRef<FlatList>(null);

  const user = useAuthStore((state) => state.user);
  const { chatId: rawChatId } = useLocalSearchParams();
  const chatId = Array.isArray(rawChatId) ? rawChatId[0] : rawChatId;
  // Get chat and messages from stores
  const { currentChat, getChatById, setCurrentChat, updateChat, clearChat } =
    useChatStore();
  const {
    messages: storedMessages,
    addMessage,
    prependMessages,
    setMessages,
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

  // Socketio
  useEffect(() => {
    const socket = getSocket();
    if (chatId && socket) {
      socket.emit("join-chat", chatId);
    }

    return () => {
      socket?.off("receive-message");
    };
  }, [chatId]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !chatId || !currentChat || !currentChat._id) return;

    socket.on("receive-message", (message: Message) => {
      if (message.chat._id === chatId) {
        addMessage(chatId, message);

        const updatedChat: Chat = {
          ...currentChat,
          _id: currentChat._id, // ensures _id is included
          latestMessage: message,
          updatedAt: message.createdAt,
        };

        updateChat(updatedChat);
      }
    });

    return () => {
      socket.off("receive-message");
    };
  }, [chatId, currentChat]);
  // or

  // useEffect(() => {
  //   const socket = getSocket();
  //   if (!socket) return;

  //   socket.on("receive-message", (message: Message) => {
  //     if (message.chat._id === chatId) {
  //       addMessage(chatId, message);
  //       updateChat({
  //         ...currentChat,
  //         latestMessage: message,
  //         updatedAt: message.createdAt,
  //       } as Chat);
  //     }
  //   });

  //   return () => {
  //     socket.off("receive-message");
  //   };
  // }, [chatId, currentChat]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !chatId) return;

    const handleTyping = ({
      chatId: typingChatId,
      user: typingUserData,
    }: {
      chatId: string;
      user: User;
    }) => {
      if (typingChatId === chatId && typingUserData._id !== user?._id) {
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

    socket.on("typing", handleTyping);
    socket.on("stop-typing", handleStopTyping);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stop-typing", handleStopTyping);
    };
  }, [chatId, user]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !chatId) return;

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
  const isPendingChat =
    currentChat.isPending && currentChat.initiator._id !== user._id;

  // Handle send message
  const handleSendMessage = async () => {
    setIsSentMessage(true);
    if (!newMessage.trim() || !chatId || !currentChat) return;

    try {
      const socket = getSocket();
      setNewMessage("");
      socket?.emit("stop-typing", { chatId });

      const data = await createMessage(chatId, newMessage.trim());
      const newMsg = data.result;

      const newUpdatedChat = {
        ...currentChat,
        latestMessage: newMsg,
        updatedAt: newMsg.createdAt,
      };

      addMessage(chatId, newMsg);
      updateChat(newUpdatedChat);

      // ✅ Emit to socket
      socket?.emit("send-message", chatId, newMsg);

      // Trigger scroll only after the message is added/rendered
    } catch (error: any) {
      ToastAndroid.show(error.message, ToastAndroid.SHORT);
    }
  };

  // Handle request chat
  const handleAccept = async () => {
    setIsLoading(true);
    try {
      await acceptChatRequest(chatId);
      const newUpdatedChat = {
        ...currentChat,
        isPending: false,
      };
      updateChat(newUpdatedChat);
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

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: color.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      {/* Header */}
      <ThemedView
        style={[styles.header, { borderBottomColor: color.borderColor }]}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={22} color={color.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => console.log("Profile")}>
          <Image source={chatPhoto} style={styles.chatPhoto} />
        </TouchableOpacity>
        <ThemedText type="subtitle" style={styles.headerTitle}>
          {chatName}
        </ThemedText>
        {/* Header icons */}
        {!isPendingChat && (
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
        )}
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
          <ThemedText type="smallItalic">Typing...</ThemedText>
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
              <Ionicons name="happy-outline" size={22} color={color.icon} />
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
            style={[styles.sendButton, { backgroundColor: color.main }]}
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
    padding: 15,
    // paddingRight: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 0.2,
  },
  headerTitle: { flex: 1, marginLeft: 10 },
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
  chatPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ccc", // Or avatar placeholder color
    marginLeft: 10,
  },

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
});
