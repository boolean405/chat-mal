import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  TouchableOpacity,
  ToastAndroid,
} from "react-native";

import { Chat } from "@/types";
import { Colors } from "@/constants/colors";
import ChatItem from "@/components/ChatItem";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useRouter } from "expo-router";
import BottomSheetAction from "@/components/BottomSheetActions";
import { getPaginateChats, readChat } from "@/api/chat";
import ChatEmpty from "@/components/ChatEmpty";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";
import usePaginatedData from "@/hooks/usePaginateData";
import { Ionicons } from "@expo/vector-icons";
import { useBottomSheetActions } from "@/hooks/useBottomSheetActions";
import useTimeTickWhenFocused from "@/hooks/useTimeTickWhenFocused";
import { useMessageStore } from "@/stores/messageStore";

export default function ArchivedChats() {
  // Hard coded render
  useTimeTickWhenFocused();

  const router = useRouter();
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];
  const user = useAuthStore((state) => state.user);
  const isNavigatingRef = useRef(false);

  const [isLoading, setIsLoading] = useState(false);

  const { clearMessages } = useMessageStore();

  const {
    chats,
    onlineUserIds,
    setChats,
    updateChat,
    clearChat,
    clearGroup,
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
    fetchData: async (pageNum: number) => {
      const data = await getPaginateChats({ pageNum, archived: true });
      return {
        items: data.result.chats,
        totalPage: data.result.totalPage,
      };
    },
  });

  const {
    selectedChat,
    isSheetVisible,
    filteredOptions,
    openSheet,
    closeSheet,
    handleOptionSelect,
  } = useBottomSheetActions({
    user,
    clearChat,
    setChats,
    clearGroup,
    clearMessages,
    updateChat,
  });

  // Update store when new chats are fetched
  // useEffect(() => {
  //   if (!isFetching && newChats.length > 0) {
  //     clearAllChats();
  //     setChats(newChats);
  //   }
  // }, [newChats, clearAllChats, setChats, isFetching]);

  useEffect(() => {
    if (!isFetching && newChats.length > 0) {
      newChats.forEach((newChat) => {
        const existing = getChatById(newChat._id);
        // Merge only if not present or newer
        if (!existing) {
          setChats([newChat]);
        }
      });
    }
  }, [newChats, getChatById, setChats, isFetching]);

  if (!user) return null;
  // const allRequestChats = chats.filter(
  //   (chat) => chat.isPending && chat.initiator._id !== user._id
  // );

  const allArchivedChats = chats.filter((chat) => {
    // ✅ Only include archived chats
    const isArchived = chat.archivedInfos?.some(
      (info) =>
        (typeof info.user === "string" ? info.user : info.user?._id) ===
        user._id
    );
    if (!isArchived) return false;

    // ❌ Exclude if user deleted it
    const deletedInfo = chat.deletedInfos?.find(
      (info) =>
        (typeof info.user === "string" ? info.user : info.user?._id) ===
        user._id
    );

    if (!deletedInfo) return true; // not deleted → show it

    const deletedAt = new Date(deletedInfo.deletedAt);

    // If the chat has newer activity than when it was deleted → show
    if (chat.latestMessage?.createdAt) {
      const latestMsgAt = new Date(chat.latestMessage.createdAt);
      return deletedAt < latestMsgAt;
    }

    if (chat.updatedAt) {
      const chatUpdatedAt = new Date(chat.updatedAt);
      return deletedAt < chatUpdatedAt;
    }

    // No new activity since delete → hide
    return false;
  });

  // Handle chat request press
  const handleChatPress = async (chat: Chat) => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setIsLoading(true);

    try {
      if (!getChatById(chat._id)) {
        setChats([chat]);
      }
      if (chat.unreadInfos?.length > 0) {
        const myUnread = chat.unreadInfos.find(
          (uc) => uc.user._id === user?._id && uc.count > 0
        );

        if (myUnread) {
          // ✅ Optimistically mark as read in Zustand
          updateChat({
            ...chat,
            unreadInfos: chat.unreadInfos.map((uc) => {
              const userId =
                typeof uc.user === "object" ? uc.user._id : uc.user;
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
    } catch (error: any) {
      ToastAndroid.show(error.message, ToastAndroid.SHORT);
    } finally {
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 1000); // consistent delay for all cases
      setIsLoading(false);
    }
  };

  // Other user name
  const selectedChatName =
    selectedChat?.name ||
    selectedChat?.users?.find((u) => u.user._id !== user._id)?.user?.name;

  return (
    <ThemedView style={styles.container}>
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
        <ThemedView style={styles.headerTitleContainer}>
          <ThemedText type="headerTitle">Archived Chats</ThemedText>
        </ThemedView>
        {/* <TouchableOpacity onPress={() => console.log("setting")}>
          <Ionicons name="cog-outline" size={22} color={color.primaryIcon} />
        </TouchableOpacity> */}
      </ThemedView>

      {/* Chats */}
      <FlatList
        data={allArchivedChats}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        refreshing={isRefreshing}
        ListEmptyComponent={<ChatEmpty />}
        onRefresh={refresh}
        onEndReached={loadMore}
        onEndReachedThreshold={1}
        contentContainerStyle={{ paddingBottom: 20 }}
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
              disabled={isLoading}
              onPress={() => handleChatPress(item)}
              onProfilePress={() => console.log(item.name)}
              onLongPress={() => openSheet(item)}
            />
          );
        }}
        ListFooterComponent={
          hasMore && chats.length > 0 && isPaging ? (
            <ActivityIndicator size="small" color={color.primaryIcon} />
          ) : null
        }

        // ItemSeparatorComponent={() => (
        //   <ThemedView
        //     style={[styles.separator, { backgroundColor: color.secondaryText }]}
        //   />
        // )}
      />

      {/* Custom Sheet */}
      <BottomSheetAction
        visible={isSheetVisible}
        title={selectedChatName}
        options={filteredOptions}
        onSelect={handleOptionSelect}
        onCancel={closeSheet}
      />
    </ThemedView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    padding: 15,
    // paddingRight: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 0.4,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    marginRight: 22,
  },

  separator: {
    height: 1,
    marginLeft: 78,
  },

  storyItem: {
    width: 70,
    alignItems: "center",
    marginRight: 12,
  },
  storyAvatarWrapper: {
    borderRadius: 40,
    padding: 2,
  },
  storyAvatarBorder: {
    borderWidth: 2,
    // borderColor: "#25D366",
  },
  storyAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ccc",
  },
  storyName: {
    marginTop: 4,
    fontSize: 12,
    maxWidth: 70,
    textAlign: "center",
  },

  // My Story (+ icon)
  myStoryAvatarWrapper: {
    borderWidth: 0,
    position: "relative",
  },
  plusIconWrapper: {
    position: "absolute",
    bottom: -2,
    right: -2,
    borderRadius: 11,
  },
});
