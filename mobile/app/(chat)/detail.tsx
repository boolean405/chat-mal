import {
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  useColorScheme,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "@/constants/colors";
import { Image } from "expo-image";
import { ListSection } from "@/components/ListSection";
import { ToastAndroid } from "react-native";
import { createGroup, deleteChat, getChat } from "@/api/chat";
import { DetailItem } from "@/types";
import { useChatData } from "@/hooks/useChatData";
import LoadingIndicator from "@/components/LoadingIndicator";
import { getChatPhoto } from "@/utils/getChatPhoto";
import { getChatName } from "@/utils/getChatName";
import { useAuthStore } from "@/stores/authStore";

export default function Detail() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];

  const user = useAuthStore((state) => state.user);
  const { chatId: rawChatId } = useLocalSearchParams();
  const chatId = Array.isArray(rawChatId) ? rawChatId[0] : rawChatId;
  const { chat, isLoading, error } = useChatData(chatId);
  if (!chat || !user) return null;

  const chatPhoto = getChatPhoto(chat, user._id);
  const chatName = chat.name || getChatName(chat, user._id);

  // Base items
  const baseDetails: DetailItem[] = [
    {
      id: "1",
      label: "Search in chat",
      iconName: "search-outline",
      path: "/search",
    },
    {
      id: "2",
      label: "Archive",
      iconName: "archive-outline",
      path: "/archive",
    },
    {
      id: "3",
      label: "Mute",
      iconName: "notifications-off-outline",
      path: "/mute",
    },

    {
      id: "8",
      label: "Delete",
      iconName: "trash-outline",
      path: "/delete",
    },
  ];

  // Group-only items
  const groupOnlyDetails: DetailItem[] = [
    {
      id: "5",
      label: "Members",
      iconName: "people-outline",
      path: "/members",
    },
    {
      id: "7",
      label: "Leave group",
      iconName: "log-out-outline",
      path: "/leave-group",
    },
  ];
  const chatOnlyDetails: DetailItem[] = [
    {
      id: "4",
      label: `Create group chat with ${chat?.name}`,
      iconName: "person-outline",
      path: "/create-group",
    },
    {
      id: "6",
      label: "Block",
      iconName: "remove-circle-outline",
      path: "/block",
    },
  ];

  // Final list
  const Details: DetailItem[] = (
    chat?.isGroupChat
      ? [...baseDetails, ...groupOnlyDetails]
      : [...baseDetails, ...chatOnlyDetails]
  ).sort((a, b) => Number(a.id) - Number(b.id));

  // const [chats, setChats] = useState<Chat | null>(null);

  // Fetch chat data
  useEffect(() => {
    if (error) {
      ToastAndroid.show(error, ToastAndroid.SHORT);
    }
  }, [error]);

  if (isLoading || !chat) {
    return null;
  }

  // Handle detail
  const handleDetail = async (item: DetailItem) => {
    if (item.path === "/members")
      router.push({
        pathname: "/(chat)/member",
        params: {
          chatId: chatId,
        },
      });
    else if (item.path === "/create-group") {
      try {
        const userIds = chat?.users?.map((user) => user.user._id) ?? [];
        const data = await createGroup(userIds);
        if (data.status) ToastAndroid.show(data.message, ToastAndroid.SHORT);
      } catch (error: any) {
        ToastAndroid.show(error.message, ToastAndroid.SHORT);
      } finally {
      }
    } else if (item.path === "/delete") {
      Alert.alert("Delete Chat", "Are you sure you want to delete this chat?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const data = await deleteChat(chatId);
              if (data.status) {
                ToastAndroid.show(data.message, ToastAndroid.SHORT);
                router.replace("/(tab)");
              }
            } catch (error: any) {
              ToastAndroid.show(error.message, ToastAndroid.SHORT);
            }
          },
        },
      ]);
    }
  };

  return (
    <>
      {/* Header */}
      <ThemedView
        style={[styles.header, { borderBottomColor: color.borderColor }]}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={22} color={color.icon} />
        </TouchableOpacity>
        <ThemedView style={styles.HeaderTitleContainer}>
          <ThemedText type="subtitle">Details</ThemedText>
        </ThemedView>
      </ThemedView>

      <ScrollView
        contentContainerStyle={[styles.scrollContainer]}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedView style={styles.container}>
          {/* Profile photo */}
          <TouchableOpacity
            style={[
              styles.profileImageWrapper,
              { borderColor: color.borderColor },
            ]}
          >
            <Image source={chatPhoto} style={styles.profilePhoto} />
          </TouchableOpacity>

          <ThemedView style={styles.bottomContainer}>
            <ThemedText type="title" style={styles.nameText}>
              {chatName}
            </ThemedText>
            {/* <ThemedText type="subtitle">
                        {username && `@${username}`}
                      </ThemedText> */}

            {/* Icon container */}
            <ThemedView style={styles.iconContainer}>
              <TouchableOpacity>
                <Ionicons
                  name="call-outline"
                  size={22}
                  style={{ color: color.icon }}
                />
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons
                  name="videocam-outline"
                  size={22}
                  style={{ color: color.icon, marginLeft: 30 }}
                />
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons
                  name="person-outline"
                  size={22}
                  style={{ color: color.icon, marginLeft: 30 }}
                />
              </TouchableOpacity>
              {/* <Ionicons
                name="person-outline"
                size={22}
                style={{ color: color.icon }}
                /> */}
            </ThemedView>

            {/* Details */}

            <ThemedView style={styles.listContainer}>
              <ListSection
                title="Details"
                data={Details}
                onItemPress={(item) => handleDetail(item)}
              />
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 50,
    paddingTop: 50,
    // justifyContent: "center",
    // alignItems: "center",
  },
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
    marginRight: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    // marginTop: 50,
    // justifyContent: "center",
  },
  profileImageWrapper: {
    // position: "relative",
    width: 120,
    height: 120,
    marginTop: -30,
    borderRadius: 60,
    alignSelf: "center",
    borderWidth: 2,
    overflow: "hidden",
  },
  profilePhoto: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  profilePlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  nameText: {
    // marginTop: 20,
    marginHorizontal: 30,
    textAlign: "center",
  },
  bottomContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: 20,
  },

  iconContainer: {
    flexDirection: "row",
    marginTop: 20,
    marginBottom: 70,
  },
  listContainer: {
    width: "80%",
  },
});
