import {
  TouchableOpacity,
  useColorScheme,
  StyleSheet,
  ScrollView,
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
import { createGroup, deleteChat, leaveGroup } from "@/api/chat";
import { DetailItem } from "@/types";
import { getChatPhoto } from "@/utils/getChatPhoto";
import { getChatName } from "@/utils/getChatName";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { DetailsData } from "@/constants/data";

export default function Detail() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];

  const user = useAuthStore((state) => state.user);
  const { getChatById, setChats, clearChat } = useChatStore();

  const { chatId: rawChatId } = useLocalSearchParams();
  const chatId = Array.isArray(rawChatId) ? rawChatId[0] : rawChatId;

  const chat = getChatById(chatId);
  if (!chat || !user) return null;

  const chatPhoto = getChatPhoto(chat, user._id);
  const chatName = chat.name || getChatName(chat, user._id);

  // Filter based on chat type
  const Details: DetailItem[] = DetailsData.filter(
    (item) =>
      item.showFor === "all" ||
      (chat?.isGroupChat && item.showFor === "group") ||
      (!chat?.isGroupChat && item.showFor === "chat")
  ).sort((a, b) => Number(a.id) - Number(b.id));

  // Handle detail press
  const handleDetail = async (item: DetailItem) => {
    // Member
    if (item.path === "/members")
      router.push({
        pathname: "/(chat)/member",
        params: {
          chatId: chatId,
        },
      });
    // Create group
    else if (item.path === "/create-group") {
      try {
        const userIds = chat?.users?.map((user) => user.user._id) ?? [];
        const data = await createGroup(userIds);
        if (data.status) {
          ToastAndroid.show(data.message, ToastAndroid.SHORT);
          setChats([data.result]);
          router.replace({
            pathname: "/(tab)",
            params: {
              chatId: data.result._id,
            },
          });
        }
      } catch (error: any) {
        ToastAndroid.show(error.message, ToastAndroid.SHORT);
      } finally {
      }
    }
    // Delete
    else if (item.path === "/delete") {
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
                clearChat(chatId);
                router.replace("/(tab)");
              }
            } catch (error: any) {
              ToastAndroid.show(error.message, ToastAndroid.SHORT);
            }
          },
        },
      ]);
    }
    // Leave group
    else if (item.path === "/leave-group") {
      Alert.alert(
        "Leave Group",
        "Are you sure you want to leave from this group?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                const data = await leaveGroup(chatId);
                if (data.status) {
                  ToastAndroid.show(data.message, ToastAndroid.SHORT);
                  clearChat(chatId);
                  router.replace("/(tab)");
                }
              } catch (error: any) {
                ToastAndroid.show(error.message, ToastAndroid.SHORT);
              }
            },
          },
        ]
      );
    }
  };

  return (
    <>
      {/* Header */}
      <ThemedView style={[styles.header, { borderBottomColor: color.border }]}>
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
            style={[styles.profileImageWrapper, { borderColor: color.border }]}
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
