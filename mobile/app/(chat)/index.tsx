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

import { Message, User } from "@/types";
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
import { useUiStore } from "@/stores/uiStore";
import CameraModal from "@/components/Camera";
import { useCallStore } from "@/stores/callStore";
import ImagePreview from "@/components/ImagePreview";
import VideoPreview from "@/components/VideoPreview";
import { chatMediaPicker } from "@/utils/chatMediaPicker";
import { useNetworkStore } from "@/stores/useNetworkStore";
import useTimeTickWhenFocused from "@/hooks/useTimeTickWhenFocused";

export default function ChatMessage() {
  useTimeTickWhenFocused();
  useUiStore((state) => state.timeTick);

  const router = useRouter();
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];
  const flatListRef = useRef<FlatList>(null);

  const user = useAuthStore((state) => state.user);
  const { chatId } = useLocalSearchParams() as { chatId: string };
  const networkInfo = useNetworkStore((state) => state.networkInfo);

  // Get chat and messages from stores
  const {
    currentChat,
    onlineUserIds,
    getChatById,
    setCurrentChat,
    updateChat,
    clearChat,
    setActiveChatId,
  } = useChatStore();

  const {
    messages: storedMessages,
    addMessage,
    prependMessages,
    setMessages,
    markMessagesAsSeen,
  } = useMessageStore();

  const { setRequestCall, isCallActive, callData } = useCallStore();

  // Get messages for current chat from store
  const currentMessagesRaw = chatId ? storedMessages[chatId] || [] : [];
  const currentMessages = Array.from(
    new Map(currentMessagesRaw.map((msg) => [msg._id, msg])).values()
  );

  const [newMessage, setNewMessage] = useState("");
  const [hasEmittedTyping, setHasEmittedTyping] = useState(false);
  const [isSentMessage, setIsSentMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<User | null>(null);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [pendingMediaPreview, setPendingMediaPreview] = useState<{
    uri: string;
    base64: string;
    type: "image" | "video";
    isLoading: boolean;
  } | null>(null);

  // Set current chat when screen mounts
  useEffect(() => {
    if (chatId) {
      const chat = getChatById(chatId);
      if (chat) setCurrentChat(chat);
      else setCurrentChat(null);
    }

    return () => setCurrentChat(null);
  }, [chatId, getChatById, setCurrentChat]);

  // Pagination handling
  const {
    // isLoading: loading,
    isRefreshing,
    isPaging,
    hasMore,
    // refresh,
    loadMore,
  } = usePaginatedData<Message>({
    fetchData: async (page: number) => {
      if (!chatId) return { items: [], totalPage: 0 };
      // const alreadyLoaded = storedMessages[chatId]?.length > 0;

      // ⛔ Skip page 1 fetch if messages are already in store
      // if (page === 1 && alreadyLoaded) {
      //   return {
      //     items: storedMessages[chatId]!,
      //     totalPage: 1,
      //   };
      // }

      // ✅ Otherwise fetch from API
      const data = await getPaginateMessages(chatId, page);
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

  // useEffect(() => {
  //   if (!isFetching && newChats.length > 0) {
  //     clearAllChats();
  //     setChats(newChats);
  //   }
  // }, [newChats, clearAllChats, setChats, isFetching]);

  useEffect(() => {
    setActiveChatId(chatId); // when entering
    return () => setActiveChatId(null); // when leaving
  }, [chatId, setActiveChatId]);

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
    socket.on("received-message", handleReceiveMessage);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("chat-read", handleChatRead);
      socket.off("stop-typing", handleStopTyping);
      socket.off("received-message", handleReceiveMessage);
      socket.emit("leave-chat", chatId);
    };
  }, [addMessage, chatId, markMessagesAsSeen, updateChat, user]);

  // Emiting socket
  useEffect(() => {
    if (!socket || !chatId || !user) return;

    if (newMessage.trim().length > 0) {
      if (!hasEmittedTyping) {
        setHasEmittedTyping(true);
        socket.emit("typing", { chatId, user });
      }
    } else {
      setHasEmittedTyping(false);
      socket.emit("stop-typing", { chatId, user });
    }
  }, [chatId, hasEmittedTyping, newMessage, user]);

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
    if (!newMessage.trim()) return;

    setIsSentMessage(true);
    socket.emit("stop-typing", { chatId });

    // Create tmp message
    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      _id: tempId,
      content: newMessage.trim(),
      sender: user,
      chat: currentChat,
      type: "text",
      status: networkInfo?.isConnected ? "pending" : "failed",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addMessage(chatId, tempMessage);
    setNewMessage("");

    // If offline, don't send to server
    if (!networkInfo?.isConnected) return;

    // Call api message
    try {
      const data = await createMessage(chatId, newMessage.trim());
      const message = data.result;
      socket.emit("send-message", { chatId, message });

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

  // Handle press image
  const handlePressMedia = async () => {
    if (!chatId || !currentChat) return;

    setPendingMediaPreview({
      uri: "",
      base64: "",
      type: "video",
      isLoading: true,
    });

    const media = await chatMediaPicker();
    if (!media) {
      setPendingMediaPreview(null);
      return;
    }

    setPendingMediaPreview({
      uri: media.uri,
      base64: media.base64,
      type: media.type === "image" ? "image" : "video",
      isLoading: false,
    });
  };

  // Function to actually send the media after preview confirmation
  const sendPendingMedia = async () => {
    if (
      !pendingMediaPreview ||
      !chatId ||
      !currentChat ||
      !pendingMediaPreview.base64
    ) {
      setPendingMediaPreview(null);
      return;
    }
    setIsSentMessage(true);

    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      _id: tempId,
      content: pendingMediaPreview.uri,
      sender: user,
      chat: currentChat,
      type: pendingMediaPreview.type,
      status: networkInfo?.isConnected ? "pending" : "failed",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addMessage(chatId, tempMessage);

    if (!networkInfo?.isConnected) {
      setPendingMediaPreview(null);
      return;
    }

    try {
      const mimeType =
        pendingMediaPreview.type === "image" ? "image/jpeg" : "video/mp4";
      const mediaBase64 = `data:${mimeType};base64,${pendingMediaPreview.base64}`;
      const data = await createMessage(
        chatId,
        mediaBase64,
        pendingMediaPreview.type
      );
      const message = data.result;

      socket.emit("send-message", { chatId, message: message });

      setMessages(chatId, [
        message,
        ...currentMessages.filter((msg) => msg._id !== tempId),
      ]);
      updateChat(message.chat);
    } catch (error: any) {
      ToastAndroid.show(
        error.message || "Media upload failed",
        ToastAndroid.SHORT
      );
      setMessages(
        chatId,
        currentMessages.map((msg) =>
          msg._id === tempId ? { ...msg, status: "failed" } : msg
        )
      );
    } finally {
      setPendingMediaPreview(null); // Always close preview after sending
    }
  };

  // Add this function to handle the taken picture
  const handleMediaTaken = async (media: {
    uri: string;
    base64: string;
    type: string;
  }) => {
    if (!chatId || !currentChat || !media.base64) return;

    setIsSentMessage(true);

    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      _id: tempId,
      content: media.uri, // Temporarily show local image
      sender: user,
      chat: currentChat,
      type: media.type === "image" ? "image" : "video",
      status: networkInfo?.isConnected ? "pending" : "failed",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addMessage(chatId, tempMessage);

    if (!networkInfo?.isConnected) {
      setPendingMediaPreview(null);
      return;
    }

    try {
      const mimeType = media.type === "image" ? "image/jpeg" : "video/mp4";
      const mediaBase64 = `data:${mimeType};base64,${media.base64}`;
      const data = await createMessage(chatId, mediaBase64, media.type);

      const message = data.result;
      socket.emit("send-message", { chatId, message: message });

      setMessages(chatId, [
        message,
        ...currentMessages.filter((msg) => msg._id !== tempId),
      ]);

      updateChat(message.chat);
    } catch (error: any) {
      ToastAndroid.show(
        error.message || "Image upload failed",
        ToastAndroid.SHORT
      );

      setMessages(
        chatId,
        currentMessages.map((msg) =>
          msg._id === tempId ? { ...msg, status: "failed" } : msg
        )
      );
    }
  };

  const otherUser = currentChat.users?.find(
    (u) => u.user._id !== user._id
  )?.user;
  // const targetUserId = otherUser?._id;

  // Handle call
  const handlePressCall = ({ callMode }: { callMode: "audio" | "video" }) => {
    if (!isCallActive) {
      setRequestCall({ chat: currentChat, caller: user, callMode });
    } else if (callData?.chat._id !== chatId) {
      return;
    }
    router.push({
      pathname: "/(chat)/call",
      params: { chatId },
    });
  };

  const isOnline =
    otherUser && onlineUserIds.includes(otherUser?._id) ? true : false;

  if (pendingMediaPreview) {
    if (pendingMediaPreview.type === "image") {
      return (
        <ImagePreview
          photoUri={pendingMediaPreview.uri}
          isLoading={pendingMediaPreview.isLoading}
          isFrontCamera={false}
          onClose={() => setPendingMediaPreview(null)}
          onSend={() => {
            sendPendingMedia();
            setPendingMediaPreview(null);
          }}
        />
      );
    } else {
      return (
        <VideoPreview
          videoUri={pendingMediaPreview.uri}
          isLoading={pendingMediaPreview.isLoading}
          onClose={() => setPendingMediaPreview(null)}
          onSend={() => {
            sendPendingMedia();
            setPendingMediaPreview(null);
          }}
        />
      );
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: color.primaryBackground }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      {/* Header */}
      <ThemedView
        style={[styles.header, { borderBottomColor: color.primaryBorder }]}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="chevron-back-outline"
            size={22}
            color={color.primaryIcon}
          />
        </TouchableOpacity>

        {/* Profile avatar */}
        <TouchableOpacity onPress={() => console.log("Profile")}>
          <ThemedView style={styles.profilePhotoContainer}>
            <Image
              source={{ uri: chatPhoto }}
              style={[
                styles.profilePhoto,
                { borderColor: color.secondaryBorder },
              ]}
            />
            {!currentChat.isGroupChat && isOnline ? (
              <ThemedView
                style={[
                  styles.onlineIndicator,
                  {
                    borderColor: color.onlineBorder,
                    backgroundColor: color.onlineBackground,
                  },
                ]}
              />
            ) : !currentChat.isGroupChat && otherUser ? (
              <>
                {getLastTime(otherUser.lastOnlineAt) === "0m" ? (
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
                    {getLastTime(otherUser.lastOnlineAt)}
                  </ThemedText>
                )}
              </>
            ) : null}
          </ThemedView>
        </TouchableOpacity>
        <ThemedText type="larger" style={styles.chatName} numberOfLines={1}>
          {chatName}
        </ThemedText>
        {/* Header icons */}
        {!isPendingChat ? (
          <ThemedView style={styles.headerIcons}>
            <TouchableOpacity
              onPress={() => handlePressCall({ callMode: "audio" })}
            >
              <Ionicons
                name="call-outline"
                size={22}
                style={styles.icon}
                color={color.primaryIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handlePressCall({ callMode: "video" })}
            >
              <Ionicons
                name="videocam-outline"
                size={22}
                style={styles.icon}
                color={color.primaryIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/(chat)/detail")}>
              <Ionicons
                name="ellipsis-vertical-outline"
                size={22}
                style={styles.icon}
                color={color.primaryIcon}
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
            <ActivityIndicator size="small" color={color.primaryIcon} />
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
            style={[
              styles.pendingButton,
              { backgroundColor: color.secondaryBackground },
            ]}
            onPress={() => console.log("Block User")}
          >
            <ThemedText type="defaultBold" style={styles.blockText}>
              Block
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={isLoading}
            style={[
              styles.pendingButton,
              { backgroundColor: color.secondaryBackground },
            ]}
            onPress={handleDelete}
          >
            <ThemedText type="defaultBold" style={styles.deleteText}>
              Delete
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={isLoading}
            style={[
              styles.pendingButton,
              { backgroundColor: color.secondaryBackground },
            ]}
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
              { backgroundColor: color.secondaryBackground },
            ]}
          >
            <TouchableOpacity style={styles.imageButton}>
              <Ionicons
                name="add-circle-outline"
                size={22}
                color={color.primaryIcon}
              />
            </TouchableOpacity>
            <TextInput
              value={newMessage}
              onChangeText={setNewMessage}
              style={[styles.textInput, { color: color.primaryText }]}
              placeholder="Type a message"
              placeholderTextColor="gray"
              multiline
            />
            <TouchableOpacity
              onPress={handlePressMedia}
              style={styles.imageButton}
            >
              <Ionicons
                name="image-outline"
                size={22}
                color={color.primaryIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsCameraVisible(true)}
              style={styles.imageButton}
            >
              <Ionicons
                name="camera-outline"
                size={22}
                color={color.primaryIcon}
              />
            </TouchableOpacity>
          </ThemedView>
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: color.messageBackground },
            ]}
            disabled={newMessage.length === 0}
            onPress={handleSendMessage}
          >
            <Ionicons name="send-outline" size={22} color={color.primaryIcon} />
          </TouchableOpacity>
          <CameraModal
            isVisible={isCameraVisible}
            onClose={() => setIsCameraVisible(false)}
            onMediaCaptured={handleMediaTaken}
          />
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
    // backgroundColor: "#128c7e",
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
    borderWidth: 0.5,
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
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  lastOnlineText: {
    bottom: 0,
    right: 1,
    width: 12,
    height: 10,
    fontSize: 5,
    borderRadius: 5,
    fontWeight: "bold",
    position: "absolute",
    textAlign: "center",
    textAlignVertical: "center",
  },
});
