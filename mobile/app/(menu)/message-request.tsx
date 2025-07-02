import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  useColorScheme,
  Alert,
  ToastAndroid,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";

import { BottomSheetOption, Chat, Story } from "@/types";
import { Colors } from "@/constants/colors";
import ChatItem from "@/components/ChatItem";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useRouter } from "expo-router";
import BottomSheetAction from "@/components/BottomSheetActions";
import {
  createGroup,
  deleteChat,
  getPaginateChats,
  getPaginateRequestChats,
  leaveGroup,
} from "@/api/chat";
import { APP_NAME } from "@/constants";
import ChatEmpty from "@/components/chat/ChatEmpty";
import ChatHeader from "@/components/chat/ChatHeader";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";
import { Image } from "expo-image";
import usePaginatedData from "@/hooks/usePaginateData";
import { Ionicons } from "@expo/vector-icons";

const bottomSheetOptions: BottomSheetOption[] = [
  { _id: "1", name: "Archive", icon: "archive-outline" },
  { _id: "2", name: "Mute", icon: "notifications-off-outline" },
  { _id: "3", name: "Create group chat with", icon: "people-outline" },
  { _id: "4", name: "Leave group", icon: "exit-outline" },
  { _id: "5", name: "Delete", icon: "trash-outline" },
];

// Main Component
export default function MessageRequest() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];
  const user = useAuthStore((state) => state.user);
  const { setChats } = useChatStore();

  const {
    data: chats,
    isLoading: loading,
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

  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  const [errorMessage, setIsErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSheetVisible, setSheetVisible] = useState(false);
  const [isError, setIsError] = useState(false);

  if (!user || !chats) return null;

  // Long press for showing models
  const handleLongPress = (chat: Chat) => {
    setSelectedChat(chat);
    setSheetVisible(true);
  };

  // Handle chat press
  const handleChat = (chat: Chat) => {
    setChats([chat]); // Add chat to store

    router.push({
      pathname: "/(chat)",
      params: {
        chatId: chat._id,
      },
    });
  };

  const handleOptionSelect = async (index: number) => {
    const isUser = selectedChat && selectedChat.isGroupChat === false;
    const options = [
      "Archive",
      "Mute",
      ...(isUser
        ? [`Create Group Chat with ${selectedChat.name}`]
        : ["Leave group"]),
      "Delete",
    ];

    const selectedOption = options[index];

    try {
      if (selectedOption === "Delete") {
        Alert.alert("Delete Chat", "Are you sure?", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              setIsLoading(true);
              try {
                const data = await deleteChat(selectedChat?._id);
                if (data.status)
                  ToastAndroid.show(data.message, ToastAndroid.SHORT);

                setData((prev) =>
                  prev.filter((c) => c._id !== selectedChat?._id)
                );
              } catch (error: any) {
                ToastAndroid.show(error.message, ToastAndroid.SHORT);
              } finally {
                setIsLoading(false);
                setSelectedChat(null);
                setSheetVisible(false);
              }
            },
          },
        ]);
      } else if (
        selectedOption === `Create Group Chat with ${selectedChat?.name}`
      ) {
        setIsLoading(true);
        setSelectedChat(null);
        setSheetVisible(false);

        try {
          const userIds =
            selectedChat?.users?.map((user) => user.user._id) ?? [];
          const data = await createGroup(userIds);
          if (data.status) ToastAndroid.show(data.message, ToastAndroid.SHORT);
          refresh();
        } catch (error: any) {
          ToastAndroid.show(error.message, ToastAndroid.SHORT);
        } finally {
          setIsLoading(false);
          setSelectedChat(null);
          setSheetVisible(false);
        }
      } else if (selectedOption === "Leave group") {
        Alert.alert("Leave Group", "Are you sure?", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Leave",
            style: "destructive",
            onPress: async () => {
              setIsLoading(true);
              try {
                const data = await leaveGroup(selectedChat?._id);
                if (data.status)
                  ToastAndroid.show(data.message, ToastAndroid.SHORT);

                setData((prev) =>
                  prev.filter((c) => c._id !== selectedChat?._id)
                );
              } catch (error: any) {
                ToastAndroid.show(error.message, ToastAndroid.SHORT);
              } finally {
                setIsLoading(false);
                setSelectedChat(null);
                setSheetVisible(false);
              }
            },
          },
        ]);
      }
    } catch (error: any) {
      ToastAndroid.show(error.message, ToastAndroid.SHORT);
    } finally {
      setIsLoading(false);
      setSelectedChat(null);
      setSheetVisible(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <ThemedView
        style={[styles.header, { borderBottomColor: color.borderColor }]}
      >
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
        data={chats}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        refreshing={isRefreshing}
        ListEmptyComponent={<ChatEmpty />}
        onRefresh={refresh}
        onEndReached={loadMore}
        onEndReachedThreshold={1}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => {
          return (
            <ChatItem
              chat={item}
              onPress={() => handleChat(item)}
              onProfilePress={() => console.log(item.name)}
              onLongPress={() => handleLongPress(item)}
            />
          );
        }}
        ListHeaderComponent={
          <ThemedView style={styles.headerContainer}>
            <ThemedText type="param">
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
        options={bottomSheetOptions.flatMap(({ _id, name, icon }) => {
          if (_id === "3") {
            return selectedChat?.isGroupChat === false
              ? [{ _id, name: `${name} ${selectedChat.name}`, icon }]
              : [];
          }
          if (_id === "4") {
            return selectedChat?.isGroupChat ? [{ _id, name, icon }] : [];
          }
          return [{ _id, name, icon }];
        })}
        onSelect={handleOptionSelect}
        onCancel={() => setSheetVisible(false)}
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
