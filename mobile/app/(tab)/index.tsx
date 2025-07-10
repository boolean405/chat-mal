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
import { BottomSheetOption, Chat, Story } from "@/types";
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
  const router = useRouter();
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  const {
    chats,
    onlineUserIds,
    setChats,
    updateChat,
    clearChat,
    clearGroup,
    clearChats,
    setOnlineUserIds,
  } = useChatStore();

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
  });

  // Socket io
  useEffect(() => {
    if (!accessToken) return;

    socket.io.opts.query = { accessToken };
    socket.connect();

    socket.on("connect", () => {
      console.log("✅ Connected to socket.io server");
    });

    socket.on("connect_error", (err) => {
      console.log("❌ Socket connection error:", err.message);
    });

    socket.on("online-users", (userIds: string[]) => {
      console.log("🟢 Online users:", userIds);
      setOnlineUserIds(userIds);
    });

    return () => {
      socket.disconnect();
      socket.off("online-users");
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
    if (chat.unreadCounts?.length) {
      const myUnread = chat.unreadCounts.find(
        (uc) => uc.user._id === user?._id && uc.count > 0
      );

      if (myUnread) {
        // ✅ Optimistically mark as read in Zustand
        updateChat({
          ...chat,
          unreadCounts: chat.unreadCounts.map((uc) => {
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

  const allChats = chats.filter(
    (chat) => !chat.isPending || chat.initiator?._id === user?._id
  );

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
          let isOnline = false;
          const otherUserId = item.users.find((u) => u.user._id !== user._id)
            ?.user._id;

          if (otherUserId) isOnline = onlineUserIds.includes(otherUserId);
          return (
            <ChatItem
              chat={item}
              user={user}
              onPress={() => handleChatPress(item)}
              onLongPress={() => openSheet(item)}
              isOnline={isOnline}
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
        color={color}
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
