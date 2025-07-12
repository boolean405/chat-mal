import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  RefreshControl,
  Alert,
  ToastAndroid,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { BottomSheetOption, Chat, Message, Story } from "@/types";
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
import { createOrOpen, getPaginateChats, readChat } from "@/api/chat";
import { useChatStore } from "@/stores/chatStore";
import { useBottomSheetActions } from "@/hooks/useBottomSheetActions";
import { socket } from "@/config/socket";
import useTimeTickWhenFocused from "@/hooks/useTimeTickWhenFocused";
import { useMessageStore } from "@/stores/messageStore";

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
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  const { addMessage, clearMessages } = useMessageStore();

  const {
    chats,
    onlineUserIds,
    setChats,
    updateChat,
    clearChat,
    clearGroup,
    clearChats,
    setOnlineUserIds,
    getChatById,
  } = useChatStore();
  // const updateChat = useChatStore((state) => state.updateChat);
  // const chats = useChatStore((state) => state.chats);

  // Paginated data handling
  const {
    data: newChats,
    isLoading,
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
    isLoadingAction,
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
    if (!accessToken) return;

    // Initinal socket
    if (!socket.connected) {
      socket.io.opts.query = { accessToken };
      socket.connect();
    }

    // Listen for socket connection
    socket.on("connect", () => {
      console.log("✅ Connected to socket.io.");
    });

    // Socket connection error
    socket.on("connect_error", (err) => {
      console.log("❌ Socket connection error:", err.message);
    });

    // Online users
    socket.on("online-users", (userIds: string[]) => {
      console.log("🟢 Online user count:", userIds.length);
      setOnlineUserIds(userIds);
    });

    // Listen for latestMessage updates
    socket.on("new-message", ({ message }) => {
      updateChat(message.chat);
    });

    // User offline
    socket.on("user-went-offline", ({ userId, lastOnlineAt }) => {
      useChatStore.getState().updateUserLastOnlineAt(userId, lastOnlineAt);
    });

    // Listen for new chat creation
    socket.on("new-chat", ({ chat }) => {
      const existingChat = getChatById(chat._id);
      if (!existingChat) {
        setChats([chat]);
        console.log("New chat created:", chat.name);
      }
    });

    socket.on("receive-message", ({ message }) => {
      setChats([message.chat]);
      addMessage(message.chat._id, message);
    });

    // 🧼 Clean up all listeners on unmount
    return () => {
      socket.disconnect();
      socket.off("connect");
      socket.off("connect_error");
      socket.off("online-users");
      socket.off("new-message");
      socket.off("user-went-offline");
      socket.off("new-chat");
      socket.off("receive-message");
    };
  }, [accessToken]);

  // Update store when new chats are fetched
  useEffect(() => {
    if (newChats.length > 0) {
      clearChats();
      setChats(newChats);
    }
  }, [newChats]);

  if (!user) return null;

  // Update chat press handler
  const handleChatPress = async (chat: Chat) => {
    if (chat.unreadInfos?.length) {
      const myUnread = chat.unreadInfos.find(
        (uc) => uc.user._id === user?._id && uc.count > 0
      );

      if (myUnread) {
        // ✅ Optimistically mark as read in Zustand
        updateChat({
          ...chat,
          unreadInfos: chat.unreadInfos.map((uc) => {
            const userId = typeof uc.user === "object" ? uc.user._id : uc.user;
            return userId === user._id ? { ...uc, count: 0 } : uc;
          }),
        });

        // ✅ Then sync with backend
        try {
          await readChat(chat._id);
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
  };

  // const allChats = chats.filter(
  //   (chat) =>
  //     chat.isPending === false ||
  //     (chat.isPending === true && chat.initiator._id === user._id)
  // );
 const allChats = chats.filter((chat) => {
  const isPending = chat?.isPending ?? false;
  const initiatorId =
    typeof chat.initiator === "string"
      ? chat.initiator
      : chat.initiator?._id;

  // pending requests the user didn’t create → hide
  if (isPending && initiatorId !== user._id) return false;

  // was this chat deleted by me?
  const deletedInfo = chat.deletedInfos?.find(
    (info) =>
      (typeof info.user === "string" ? info.user : info.user?._id) === user._id
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
          const targetUser = item.users.find(
            (u) => u.user._id !== user._id
          )?.user;

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
    width: 50,
    height: 50,
  },
  listContent: {
    paddingBottom: 20,
  },
});
