import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  useColorScheme,
  Alert,
  ToastAndroid,
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
import {
  createGroup,
  deleteChat,
  getPaginateChats,
  leaveGroup,
} from "@/api/chat";
import { useChatStore } from "@/stores/chatStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

// Bottom sheet options - can be dynamic based on chat type
const getBottomSheetOptions = (isGroupChat: boolean): BottomSheetOption[] => [
  { _id: "1", name: "Archive", icon: "archive-outline" },
  { _id: "2", name: "Mute", icon: "notifications-off-outline" },
  ...(!isGroupChat
    ? [{ _id: "3", name: "Create group chat", icon: "people-outline" }]
    : []),
  ...(isGroupChat
    ? [{ _id: "4", name: "Leave group", icon: "exit-outline" }]
    : []),
  { _id: "5", name: "Delete", icon: "trash-outline" },
];

export default function Home() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];
  const user = useAuthStore((state) => state.user);
  const {
    chats: storedChats,
    setChats,
    updateChat,
    clearChat,
    leaveGroup: leaveGroupFromStore,
  } = useChatStore();

  // Paginated data handling
  const {
    data: newChats,
    isLoading: loading,
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

  useEffect(() => {
    const checkStorage = async () => {
      await AsyncStorage.getItem("chat-storage");
    };
    checkStorage();
  }, []);

  // Update store when new chats are fetched
  useEffect(() => {
    if (newChats.length > 0) {
      setChats(newChats);
    }
  }, [newChats]);

  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isSheetVisible, setSheetVisible] = useState(false);
  const [isLoadingAction, setIsLoadingAction] = useState(false);

  if (!user) return null;

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

  // Long press handler
  const handleLongPress = useCallback((chat: Chat) => {
    setSelectedChat(chat);
    setSheetVisible(true);
  }, []);

  // Delete chat handler
  const handleDeleteChat = useCallback(async () => {
    if (!selectedChat) return;

    Alert.alert("Delete Chat", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const data = await deleteChat(selectedChat._id);
          if (data.status) {
            ToastAndroid.show(data.message, ToastAndroid.SHORT);
            clearChat(selectedChat._id);
          }
        },
      },
    ]);
  }, [selectedChat]);

  // Create group handler
  const handleCreateGroup = useCallback(async () => {
    if (!selectedChat) return;

    const userIds = selectedChat.users?.map((user) => user.user._id) ?? [];
    setIsLoadingAction(true);

    try {
      const data = await createGroup(userIds);
      if (data.status) {
        ToastAndroid.show(data.message, ToastAndroid.SHORT);

        // Manually add the new group to the top of the list
        if (data.result) {
          setChats([data.result]);
        }
      }
    } catch (error: any) {
      ToastAndroid.show(error.message, ToastAndroid.SHORT);
    } finally {
      setIsLoadingAction(false);
    }
  }, [selectedChat, setChats, refresh]);

  // Leave group handler
  const handleLeaveGroup = useCallback(async () => {
    if (!selectedChat) return;

    Alert.alert("Leave Group", "Are you sure you want to leave this group?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: async () => {
          try {
            setIsLoadingAction(true);
            const data = await leaveGroup(selectedChat._id);

            if (data.status) {
              ToastAndroid.show(data.message, ToastAndroid.SHORT);
              leaveGroupFromStore(selectedChat._id); // Update Zustand store
            }
          } catch (error: any) {
            ToastAndroid.show(error.message, ToastAndroid.SHORT);
          } finally {
            setIsLoadingAction(false);
          }
        },
      },
    ]);
  }, [selectedChat, leaveGroupFromStore]);

  // Filtered bottom sheet options based on chat type
  const filteredOptions = selectedChat
    ? getBottomSheetOptions(selectedChat.isGroupChat)
    : [];

  // Handle bottom sheet actions
  const handleOptionSelect = useCallback(
    async (index: number) => {
      if (!selectedChat) return;

      const isGroup = selectedChat.isGroupChat;
      const options = getBottomSheetOptions(isGroup);
      const selectedOption = options[index];

      try {
        setIsLoadingAction(true);

        switch (selectedOption.name) {
          case "Delete":
            await handleDeleteChat();
            break;
          case "Create group chat":
            await handleCreateGroup();
            break;
          case "Leave group":
            await handleLeaveGroup(); // This will now use the updated function
            break;
          default:
            ToastAndroid.show(
              `${selectedOption.name} pressed`,
              ToastAndroid.SHORT
            );
            break;
        }
      } catch (error: any) {
        ToastAndroid.show(error.message, ToastAndroid.SHORT);
      } finally {
        setIsLoadingAction(false);
        setSheetVisible(false);
        setSelectedChat(null);
      }
    },
    [selectedChat, handleDeleteChat, handleCreateGroup, handleLeaveGroup]
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
        data={storedChats || []}
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
            onPress={() => handleChatPress(item)}
            onLongPress={() => handleLongPress(item)}
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
        onCancel={() => setSheetVisible(false)}
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
