import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  useColorScheme,
  Alert,
  ToastAndroid,
  ActivityIndicator,
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
  leaveGroup,
} from "@/api/chat";
import { APP_NAME } from "@/constants";
import ChatEmpty from "@/components/chat/ChatEmpty";
import ChatHeader from "@/components/chat/ChatHeader";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";
import { Image } from "expo-image";
import usePaginatedData from "@/hooks/usePaginateData";

// Chats list

// const chats: Chat[] = [
//   {
//     _id: "1",
//     isGroupChat: false,
//     name: "John Doe",
//     latestMessage: "Hey, how are you?",
//     unreadCount: 2,
//     photo: "https://randomuser.me/api/portraits/men/1.jpg",
//     users: [],
//     groupAdmins: [],
//     deletedInfo: [],
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   },
// ];

// Stories list
const stories: Story[] = [
  {
    _id: "s2",
    name: "Family Group",
    storyUri: "https://cdn-icons-png.flaticon.com/512/1946/1946429.png",
    hasStory: false,
  },
  {
    _id: "s3",
    name: "Sarah Lane",
    storyUri: "https://randomuser.me/api/portraits/women/2.jpg",
    hasStory: true,
  },
  {
    _id: "s4",
    name: "Mike Ross",
    storyUri: "https://randomuser.me/api/portraits/men/3.jpg",
    hasStory: false,
  },
  {
    _id: "s5",
    name: "Mike Ross",
    storyUri: "https://randomuser.me/api/portraits/men/3.jpg",
    hasStory: false,
  },
  {
    _id: "s6",
    name: "Mike Ross",
    storyUri: "https://randomuser.me/api/portraits/men/3.jpg",
    hasStory: false,
  },
];

const bottomSheetOptions: BottomSheetOption[] = [
  { _id: "1", name: "Archive", icon: "archive-outline" },
  { _id: "2", name: "Mute", icon: "notifications-off-outline" },
  { _id: "3", name: "Create group chat with", icon: "people-outline" },
  { _id: "4", name: "Leave group", icon: "exit-outline" },
  { _id: "5", name: "Delete", icon: "trash-outline" },
];

// Main Component
export default function Home() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];
  const user = useAuthStore((state) => state.user);
  const { setChat } = useChatStore();

  const {
    data: chats,
    isLoading: loading,
    isRefreshing,
    isPaging,
    hasMore,
    refresh,
    loadMore,
    setData: setChats,
  } = usePaginatedData<Chat>({
    fetchData: async (page: number) => {
      const data = await getPaginateChats(page);
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

  if (!user) return null;

  // Long press for showing models
  const handleLongPress = (chat: Chat) => {
    setSelectedChat(chat);
    setSheetVisible(true);
  };

  // Handle chat press
  const handleChat = (chat: Chat) => {
    setChat(chat._id, chat);

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

                setChats((prev) =>
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

                setChats((prev) =>
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
      <ThemedView style={styles.header}>
        <ThemedText type="title">{APP_NAME}</ThemedText>
        <Image
          source={require("@/assets/images/logo.png")}
          style={{ width: 50, height: 50 }}
        />
      </ThemedView>

      {/* Chats */}
      <FlatList
        data={chats}
        keyExtractor={(item, index) =>
          item && item._id ? item._id : index.toString()
        }
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
        ListHeaderComponent={<ChatHeader stories={stories} user={user} />}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginVertical: 10,
    // paddingVertical: 10,
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
