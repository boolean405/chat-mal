import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  RefreshControl,
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
import { getPaginateChats } from "@/api/chat";
import { useChatStore } from "@/stores/chatStore";
import { useBottomSheetActions } from "@/hooks/useBottomSheetActions";

// Stories data - consider moving to a separate file or API call
const stories: Story[] = [
  {
    _id: "s2",
    name: "Family Group",
    storyUri: "https://cdn-icons-png.flaticon.com/512/1946/1946429.png",
    hasStory: false,
  },
  // ... other stories
];

export default function Home() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];
  const user = useAuthStore((state) => state.user);
  const { chats, setChats, updateChat, clearChat, clearGroup } = useChatStore();

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

  // Update store when new chats are fetched
  useEffect(() => {
    if (newChats.length > 0) {
      setChats(newChats);
    }
  }, [newChats]);

  // Update chat press handler
  const handleChatPress = useCallback(
    (chat: Chat) => {
      router.push({
        pathname: "/(chat)",
        params: { chatId: chat._id },
      });
    },
    [router]
  );
  if (!user) return null;

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
        
        renderItem={({ item }) => (
          <ChatItem
            chat={item}
            user={user}
            onPress={() => handleChatPress(item)}
            onLongPress={() => openSheet(item)}
          />
        )}
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
