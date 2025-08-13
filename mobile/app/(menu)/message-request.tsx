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
import { getPaginateRequestChats, readChat } from "@/api/chat";
import ChatEmpty from "@/components/ChatEmpty";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";
import usePaginatedData from "@/hooks/usePaginateData";
import { useBottomSheetActions } from "@/hooks/useBottomSheetActions";
import useTimeTickWhenFocused from "@/hooks/useTimeTickWhenFocused";
import { useMessageStore } from "@/stores/messageStore";
import ScreenHeader from "@/components/ScreenHeader";

export default function MessageRequest() {
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
    setChats,
    chats,
    onlineUserIds,
    clearChat,
    clearGroup,
    getChatById,
    updateChat,
  } = useChatStore();

  const {
    data: newRequestChats,
    // isLoading: loading,
    isRefreshing,
    isPaging,
    hasMore,
    refresh,
    loadMore,
    // setData,
  } = usePaginatedData<Chat>({
    fetchData: async (page: number) => {
      const data = await getPaginateRequestChats(page);
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
  useEffect(() => {
    if (newRequestChats.length > 0) {
      newRequestChats.forEach((newChat) => {
        const existing = getChatById(newChat._id);
        // Merge only if not present or newer
        if (!existing) {
          setChats([newChat]);
        }
      });
    }
  }, [newRequestChats, getChatById, setChats]);

  if (!user) return null;
  // const allRequestChats = chats.filter(
  //   (chat) => chat.isPending && chat.initiator._id !== user._id
  // );

  const allRequestChats = chats.filter((chat) => {
    const initiatorId =
      typeof chat.initiator === "string" ? chat.initiator : chat.initiator?._id;

    return chat.isPending && initiatorId !== user._id;
  });

  // Handle chat press
  // const handleChat = (chat: Chat) => {
  //   if (!getChatById(chat._id)) {
  //     console.log("added new one");
  //     setChats([chat]);
  //   }
  //   router.push({
  //     pathname: "/(chat)",
  //     params: {
  //       chatId: chat._id,
  //     },
  //   });
  // };

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
      <ScreenHeader
        title="Message Requests"
        rightButton="cog-outline"
        onRightPress={() => console.log("settings")}
      />

      {/* Chats */}
      <FlatList
        data={allRequestChats}
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
        ListHeaderComponent={
          <ThemedView style={styles.headerContainer}>
            <ThemedText>
              Open a chat for more info to see. Sender wil not know you have
              seen the message until you reply or accept the request.
            </ThemedText>
            <TouchableOpacity>
              <ThemedText type="link" style={{ fontSize: 14 }}>
                Click here to change message request settings.
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        }
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
  separator: {
    height: 1,
    marginLeft: 78,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 5,
    // flexDirection: "row",
    // alignItems: "center",
  },
});
