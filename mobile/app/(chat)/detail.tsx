import { useState } from "react";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  ToastAndroid,
  TouchableOpacity,
  useColorScheme,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";

import { DetailItem } from "@/types";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { DetailsData } from "@/constants/data";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { getChatPhoto } from "@/utils/getChatPhoto";
import { getChatName } from "@/utils/getChatName";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { useCallStore } from "@/stores/callStore";
import { ListSection } from "@/components/ListSection";
import { useMessageStore } from "@/stores/messageStore";
import { createGroup, deleteChat, leaveGroup } from "@/api/chat";

export default function Detail() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];

  const user = useAuthStore((state) => state.user);
  const { clearMessages } = useMessageStore();
  const { setRequestCall, isCallActive, callData } = useCallStore();
  const { currentChat, setChats, clearChat } = useChatStore();

  const [isLoading, setIsLoading] = useState(false);

  if (!user || !currentChat) return null;

  const chatPhoto = getChatPhoto(currentChat, user._id);
  const chatName = currentChat.name || getChatName(currentChat, user._id);

  // Filter based on chat type
  const Details: DetailItem[] = DetailsData.filter(
    (item) =>
      item.showFor === "all" ||
      (currentChat?.isGroupChat && item.showFor === "group") ||
      (!currentChat?.isGroupChat && item.showFor === "chat")
  ).sort((a, b) => Number(a.id) - Number(b.id));

  // Handle detail press
  const handleDetail = async (item: DetailItem) => {
    setIsLoading(true);

    // Member
    if (item.path === "/members")
      router.push({
        pathname: "/(chat)/member",
        params: {
          chatId: currentChat._id,
        },
      });
    // Create group
    else if (item.path === "/create-group") {
      try {
        const userIds = currentChat?.users?.map((user) => user.user._id) ?? [];
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
              const data = await deleteChat(currentChat._id);
              if (data.status) {
                ToastAndroid.show(data.message, ToastAndroid.SHORT);
                clearChat(currentChat._id);
                clearMessages(currentChat._id);
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
            text: "Leave",
            style: "destructive",
            onPress: async () => {
              try {
                const data = await leaveGroup(currentChat._id);
                if (data.status) {
                  ToastAndroid.show(data.message, ToastAndroid.SHORT);
                  clearChat(currentChat._id);
                  clearMessages(currentChat._id);
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
    setIsLoading(false);
  };

  // Handle call
  const handlePressCall = ({ callMode }: { callMode: "audio" | "video" }) => {
    if (!isCallActive) {
      setRequestCall({ chat: currentChat, caller: user, callMode });
    } else if (callData?.chat._id !== currentChat._id) {
      return;
    }
    router.push({
      pathname: "/(chat)/call",
      params: { chatId: currentChat._id },
    });
  };

  return (
    <ThemedView style={{ flex: 1, backgroundColor: color.primaryBackground }}>
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
        <ThemedView style={styles.HeaderTitleContainer}>
          <ThemedText type="headerTitle">Details</ThemedText>
        </ThemedView>
      </ThemedView>

      <ScrollView
        contentContainerStyle={[styles.scrollContainer]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.container}>
          {/* Profile photo */}
          <TouchableOpacity
            style={[
              styles.profileImageWrapper,
              { borderColor: color.secondaryBorder },
            ]}
          >
            <Image source={{ uri: chatPhoto }} style={styles.profilePhoto} />
          </TouchableOpacity>

          <ThemedView style={styles.bottomContainer}>
            <ThemedText
              type="largest"
              style={styles.nameText}
              numberOfLines={1}
            >
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
                  style={{ color: color.primaryIcon }}
                  onPress={() => handlePressCall({ callMode: "audio" })}
                />
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons
                  name="videocam-outline"
                  size={22}
                  style={{ color: color.primaryIcon, marginLeft: 30 }}
                  onPress={() => handlePressCall({ callMode: "video" })}
                />
              </TouchableOpacity>
              {!currentChat.isGroupChat && (
                <TouchableOpacity>
                  <Ionicons
                    name="person-outline"
                    size={22}
                    style={{ color: color.primaryIcon, marginLeft: 30 }}
                  />
                </TouchableOpacity>
              )}
              {/* <Ionicons
                name="person-outline"
                size={22}
                style={{ color: color.primaryIcon }}
                /> */}
            </ThemedView>

            {/* Details */}
            <ThemedView style={styles.listContainer}>
              <ListSection
                title="Details"
                disabled={isLoading}
                data={Details}
                onItemPress={(item) => handleDetail(item)}
              />
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 50,
    paddingTop: 50,
  },
  header: {
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 0.4,
  },
  HeaderTitleContainer: {
    flex: 1,
    alignItems: "center",
    marginRight: 20,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  profileImageWrapper: {
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
    backgroundColor: "#e9e9e9",
  },
  profilePlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  nameText: {
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
