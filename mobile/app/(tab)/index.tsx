import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  RefreshControl,
  ToastAndroid,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Chat, Story, User } from "@/types";

import { Colors } from "@/constants/colors";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ChatItem from "@/components/ChatItem";
import { APP_NAME } from "@/constants";
import ChatEmpty from "@/components/chat/ChatEmpty";
import ChatHeader from "@/components/chat/ChatHeader";
import { useAuthStore } from "@/stores/authStore";
import usePaginatedData from "@/hooks/usePaginateData";
import BottomSheetAction from "@/components/BottomSheetActions";
import { getPaginateChats } from "@/api/chat";
import { useChatStore } from "@/stores/chatStore";
import { useBottomSheetActions } from "@/hooks/useBottomSheetActions";
import { socket } from "@/config/socket";
import useTimeTickWhenFocused from "@/hooks/useTimeTickWhenFocused";
import { useMessageStore } from "@/stores/messageStore";
import { showNotification } from "@/utils/showNotifications";
import { useCallStore } from "@/stores/callStore";
import { webrtcClient } from "@/config/webrtcClient";

// Stories data - consider moving to a separate file or API call
const stories: Story[] = [
  {
    _id: "s2",
    name: "John Doe",
    storyUri: `${process.env.EXPO_PUBLIC_SERVER_URL}/image/profile-photo`,
    hasStory: true,
  },
  // ... other stories
];

export default function Home() {
  // Hard coded rerender
  useTimeTickWhenFocused();

  const router = useRouter();
  const isNavigatingRef = useRef(false);
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];

  const [isLoading, setIsLoading] = useState(false);

  const { user, accessToken } = useAuthStore();
  const { addMessage, clearMessages, markMessagesAsSeen } = useMessageStore();
  const { setIncomingCall, endCall, setAcceptedCall } = useCallStore();

  const {
    chats,
    onlineUserIds,
    setChats,
    updateChat,
    clearChat,
    clearGroup,
    clearAllChats,
    setOnlineUserIds,
    getChatById,
  } = useChatStore();

  // Paginated data handling
  const {
    data: newChats,
    isLoading: isFetching,
    isRefreshing,
    isPaging,
    hasMore,
    refresh,
    loadMore,
  } = usePaginatedData<Chat>({
    fetchData: async (page: number) => {
      const data = await getPaginateChats(page);
      return {
        items: data.result.chats,
        totalPage: data.result.totalPage,
      };
    },
  });

  const {
    selectedChat,
    isSheetVisible,
    // isLoadingAction,
    filteredOptions,
    openSheet,
    closeSheet,
    handleOptionSelect,
  } = useBottomSheetActions({
    clearChat,
    setChats,
    clearGroup,
    clearMessages,
  });

  // Socket io
  useEffect(() => {
    if (!accessToken || !user) return;

    // Initinal socket
    if (!socket.connected) {
      socket.io.opts.query = { accessToken };
      socket.connect();
    }

    // Listen for socket connection
    socket.on("connect", async () => {
      console.log("✅ Connected to socket.io.");
    });

    // Socket connection error
    socket.on("connect_error", (err) => {
      console.log("❌ Socket connection error:", err.message);
    });

    // Online users
    socket.on("online-users", async (userIds: string[]) => {
      console.log("🟢 Online user count:", userIds.length);
      setOnlineUserIds(userIds);

      // Request all new
      // socket.emit("fetch-all", () => {});
    });

    // Listen for latestMessage updates
    socket.on("new-message", async ({ chatId, message }) => {
      const currentChatId = useChatStore.getState().activeChatId;
      const isInCurrentChat = currentChatId === chatId;
      const isSameUser = message.sender._id === user._id;
      const content =
        message.type === "text"
          ? message.content
          : message.type === "image"
          ? "Recieved an new photo"
          : message.type === "video"
          ? "Recieved a new video"
          : message.type === "audio"
          ? "Recieved a new audio message"
          : message.type === "file"
          ? "Recieved a new file"
          : "Recieved a new message";

      if (getChatById(chatId)) updateChat(message.chat);
      else setChats([message.chat]);
      addMessage(chatId, message);

      // Show local notification if not in the same chat
      if (!isInCurrentChat && !isSameUser && !message.isNotify) {
        // Show local notification
        await showNotification({
          title: message.chat.name || message.sender.name,
          body: content,
          type: "message",
          data: { chatId, messageId: message._id },
        });
      }
    });

    // User offline
    socket.on("user-went-offline", ({ userId, lastOnlineAt }) => {
      useChatStore.getState().updateUserLastOnlineAt(userId, lastOnlineAt);
    });

    // Listen for new chat creation
    socket.on("new-chat", ({ chat }) => {
      if (!getChatById(chat._id)) {
        setChats([chat]);
      }
    });

    // Remove chat
    socket.on("remove-chat", ({ chat }) => {
      clearMessages(chat._id);
      clearChat(chat._id);
      router.replace("/(tab)");
      ToastAndroid.show(
        `You have been removed from ${chat.name}`,
        ToastAndroid.SHORT
      );
    });

    socket.on("error", ({ message }) => {
      console.log("❌ Socket error:", message);
    });

    // WebRTC incoming call
    const handleEndedCall = ({ chatId }: { chatId: string }) => {
      endCall();
    };

    const handleAcceptedCall = async ({
      chatId,
      acceptor,
    }: {
      chatId: string;
      acceptor: User;
    }) => {
      await webrtcClient.startAsCaller();
      setAcceptedCall();
    };

    const handleIncomingCall = ({
      caller,
      chat,
      callMode,
    }: {
      chat: Chat;
      caller: User;
      callMode: "video" | "audio";
    }) => {
      setIncomingCall({ chat, caller, callMode });
      router.push({
        pathname: "/(chat)/call",
        params: { chatId: chat._id },
      });
    };

    const handleUserToggledVideo = ({
      userId,
      isVideo,
    }: {
      userId: string;
      isVideo: boolean;
    }) => {
      // Save the new video state of other user in your callStore
      useCallStore.getState().updateRemoteVideoStatus(userId, isVideo);
    };

    const handleUserToggledMute = ({
      userId,
      isMuted,
    }: {
      userId: string;
      isMuted: boolean;
    }) => {
      // Save the new video state of other user in your callStore
      useCallStore.getState().updateRemoteAudioStatus(userId, isMuted);
    };

    const handleUserToggledFace = ({
      userId,
      isFaced,
    }: {
      userId: string;
      isFaced: boolean;
    }) => {
      // Save the new video state of other user in your callStore
      useCallStore.getState().updateRemoteFacingStatus(userId, isFaced);
    };

    // Read chat
    const handleChatRead = ({
      chatId,
      userId,
    }: {
      chatId: string;
      userId: string;
    }) => {
      const chat = getChatById(chatId);
      if (!chat) return;

      if (chat.unreadInfos?.length > 0) {
        const myUnread = chat.unreadInfos.find(
          (uc) => uc.user._id === user?._id && uc.count > 0
        );

        if (myUnread) {
          // Optimistically mark as read in Zustand
          updateChat({
            ...chat,
            unreadInfos: chat.unreadInfos.map((uc) => {
              const userId =
                typeof uc.user === "object" ? uc.user._id : uc.user;
              return userId === user._id ? { ...uc, count: 0 } : uc;
            }),
          });
        }
      }
    };

    socket.on("ended-call", handleEndedCall);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("accepted-call", handleAcceptedCall);
    socket.on("user-toggled-video", handleUserToggledVideo);
    socket.on("user-toggled-mute", handleUserToggledMute);
    socket.on("user-toggled-face", handleUserToggledFace);
    socket.on("chat-read", handleChatRead);

    // 🧼 Clean up all listeners on unmount
    return () => {
      socket.disconnect();
      socket.off("connect");
      socket.off("connect_error");
      socket.off("online-users");
      socket.off("new-message");
      socket.off("user-went-offline");
      socket.off("new-chat");
      socket.off("fetch-all");
      socket.off("error");
      socket.off("remove-chat");
      socket.off("ended-call", handleEndedCall);
      socket.off("incoming-call", handleIncomingCall);
      socket.off("accepted-call", handleAcceptedCall);
      socket.off("user-toggled-video", handleUserToggledVideo);
      socket.off("user-toggled-mute", handleUserToggledMute);
      socket.off("user-toggled-face", handleUserToggledFace);
      socket.on("chat-read", handleChatRead);
    };
  }, [
    user,
    router,
    accessToken,
    addMessage,
    clearChat,
    clearMessages,
    endCall,
    getChatById,
    setAcceptedCall,
    setChats,
    setIncomingCall,
    setOnlineUserIds,
    updateChat,
    markMessagesAsSeen,
  ]);

  // Update store when new chats are fetched
  useEffect(() => {
    if (!isFetching && newChats.length > 0) {
      clearAllChats();
      setChats(newChats);
    }
  }, [newChats, clearAllChats, setChats, isFetching]);

  if (!user) return null;

  // Update chat press handler
  const handleChatPress = async (chat: Chat) => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setIsLoading(true);

    try {
      if (chat.unreadInfos?.length > 0) {
        const myUnread = chat.unreadInfos.find(
          (uc) => uc.user._id === user?._id && uc.count > 0
        );

        if (myUnread) {
          // Optimistically mark as read in Zustand
          updateChat({
            ...chat,
            unreadInfos: chat.unreadInfos.map((uc) => {
              const userId =
                typeof uc.user === "object" ? uc.user._id : uc.user;
              return userId === user._id ? { ...uc, count: 0 } : uc;
            }),
          });

          // Then sync with backend
          try {
            // await readChat(chat._id);
          } catch (error: any) {
            ToastAndroid.show(error.message, ToastAndroid.SHORT);
          }
        }
      }

      // Navigate to the chat screen
      router.push({
        pathname: "/(chat)",
        params: {
          chatId: chat._id,
        },
      });
    } catch (error: any) {
      ToastAndroid.show(error.message, ToastAndroid.SHORT);
    } finally {
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 1000); // consistent delay for all cases
      setIsLoading(false);
    }
  };

  // const allChats = chats.filter(
  //   (chat) =>
  //     chat.isPending === false ||
  //     (chat.isPending === true && chat.initiator._id === user._id)
  // );
  const allChats = chats.filter((chat) => {
    const isPending = chat?.isPending ?? false;
    const initiatorId =
      typeof chat.initiator === "string" ? chat.initiator : chat.initiator?._id;

    // pending requests the user didn’t create → hide
    if (isPending && initiatorId !== user._id) return false;

    // was this chat deleted by me?
    const deletedInfo = chat.deletedInfos?.find(
      (info) =>
        (typeof info.user === "string" ? info.user : info.user?._id) ===
        user._id
    );

    // never deleted → keep
    if (!deletedInfo) return true;

    const deletedAt = new Date(deletedInfo.deletedAt);

    // latestMessage check
    if (chat.latestMessage?.createdAt) {
      const latestMsgAt = new Date(chat.latestMessage.createdAt);
      return deletedAt < latestMsgAt; // show only if a newer msg exists
    }

    // fallback to updatedAt (make sure it exists)
    if (chat.updatedAt) {
      const chatUpdatedAt = new Date(chat.updatedAt);
      return deletedAt < chatUpdatedAt;
    }
    // no activity after delete → hide
    return false;
  });

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText type="title">{APP_NAME}</ThemedText>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
          contentFit="contain"
        />
      </ThemedView>

      {/* Chat List - Now using storedChats instead of chats */}
      <FlatList
        data={allChats || []}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        refreshing={isRefreshing}
        ListEmptyComponent={<ChatEmpty />}
        onRefresh={refresh}
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          let targetUser = null;

          if (!item.isGroupChat) {
            targetUser = item.users.find((u) => u.user._id !== user._id)?.user;
          }

          const isOnline = targetUser
            ? onlineUserIds.includes(targetUser._id)
            : false;

          return (
            <ChatItem
              chat={item}
              isOnline={isOnline}
              targetUser={targetUser}
              onPress={() => handleChatPress(item)}
              onLongPress={() => openSheet(item)}
              disabled={isLoading}
            />
          );
        }}
        ListHeaderComponent={<ChatHeader stories={stories} user={user} />}
        ListFooterComponent={
          hasMore && isPaging ? (
            <ActivityIndicator size="small" color={color.icon} />
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            colors={[color.primary]} // Spinner color (Android)
            progressBackgroundColor={color.background} // Background color (Android)
            tintColor={color.primary} // Spinner color (iOS)
            title="Refreshing..." // Optional (iOS)
            titleColor={color.text} // Optional (iOS)
          />
        }
      />

      {/* Bottom Sheet Actions */}
      <BottomSheetAction
        visible={isSheetVisible}
        title={selectedChat?.name}
        options={filteredOptions}
        onSelect={handleOptionSelect}
        onCancel={closeSheet}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  logo: {
    width: 40,
    height: 40,
  },
  listContent: {
    paddingBottom: 20,
  },
});
