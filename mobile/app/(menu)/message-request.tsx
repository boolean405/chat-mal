import React, { useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";

import { Chat } from "@/types";
import { Colors } from "@/constants/colors";
import ChatItem from "@/components/ChatItem";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useRouter } from "expo-router";
import BottomSheetAction from "@/components/BottomSheetActions";
import { getPaginateRequestChats } from "@/api/chat";
import ChatEmpty from "@/components/chat/ChatEmpty";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";
import usePaginatedData from "@/hooks/usePaginateData";
import { Ionicons } from "@expo/vector-icons";
import { useBottomSheetActions } from "@/hooks/useBottomSheetActions";
import useTimeTickWhenFocused from "@/hooks/useTimeTickWhenFocused";

export default function MessageRequest() {
  // Hard coded render
  useTimeTickWhenFocused();

  const router = useRouter();
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];
  const user = useAuthStore((state) => state.user);
  const { setChats, chats, onlineUserIds, clearChat, clearGroup, getChatById } =
    useChatStore();

  const {
    data: newRequestChats,
    isLoading,
    isRefreshing,
    isPaging,
    hasMore,
    refresh,
    loadMore,
    setData,
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
    clearChat,
    setChats,
    clearGroup,
  });

  // Update store when new chats are fetched
  useEffect(() => {
    if (newRequestChats.length > 0) {
      setChats(newRequestChats);
    }
  }, [newRequestChats]);

  if (!user) return null;
  const allRequestChats = chats.filter(
    (chat) => chat.isPending && chat.initiator?._id !== user._id
  );

  // Handle chat press
  const handleChat = (chat: Chat) => {
    if (!getChatById(chat._id)) {
      console.log("added new one");
      setChats([chat]);
    }
    router.push({
      pathname: "/(chat)",
      params: {
        chatId: chat._id,
      },
    });
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <ThemedView style={[styles.header, { borderBottomColor: color.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={22} color={color.icon} />
        </TouchableOpacity>
        <ThemedView style={styles.HeaderTitleContainer}>
          <ThemedText type="subtitle">Chat Request</ThemedText>
        </ThemedView>
        <TouchableOpacity onPress={() => console.log("setting")}>
          <Ionicons name="cog-outline" size={22} color={color.icon} />
        </TouchableOpacity>
      </ThemedView>

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
          const otherUser = item.users.find(
            (u) => u.user._id !== user._id
          )?.user;

          const isOnline = otherUser
            ? onlineUserIds.includes(otherUser._id)
            : false;

          return (
            <ChatItem
              chat={item}
              isOnline={isOnline}
              otherUser={otherUser}
              onPress={() => handleChat(item)}
              onProfilePress={() => console.log(item.name)}
              onLongPress={() => openSheet(item)}
            />
          );
        }}
        ListHeaderComponent={
          <ThemedView style={styles.headerContainer}>
            <ThemedText>
              Open a chat for more info to see. Sender won't know you've seen
              the message until you reply or accept the request.
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
            <ActivityIndicator size="small" color={color.icon} />
          ) : null
        }

        // ItemSeparatorComponent={() => (
        //   <ThemedView
        //     style={[styles.separator, { backgroundColor: color.secondary }]}
        //   />
        // )}
      />

      {/* Custom Sheet */}
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
    borderBottomWidth: 0.2,
  },
  HeaderTitleContainer: {
    flex: 1,
    alignItems: "center",
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
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 5,
    // flexDirection: "row",
    // alignItems: "center",
  },
});
