import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import useDebounce from "@/hooks/useDebounce";
import {
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  ToastAndroid,
  useColorScheme,
  Alert,
} from "react-native";
import { createOrOpen } from "@/api/chat";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/colors";
import UserItem from "@/components/UserItem";
import { useUsersSearchStore } from "@/stores/usersSearchStore";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { User } from "@/types";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";
import UserPopoverMenu from "@/components/UserPopoverMenu";
import { block, checkIsFollowing, follow, unfollow } from "@/api/user";

export default function Search() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];

  const isNavigatingRef = useRef(false);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [popoverUser, setPopoverUser] = useState<User | null>(null);
  const moreButtonRefs = useRef<{ [key: string]: React.RefObject<any> }>({});

  const { user } = useAuthStore();
  const { setChats, getChatById, onlineUserIds } = useChatStore();

  const {
    results,
    // page,
    keyword,
    selectedFilter,
    hasMore,
    isLoading,
    isPaging,
    // errorMessage,
    setKeyword,
    setSelectedFilter,
    fetchSearchUsers,
  } = useUsersSearchStore();

  const debouncedKeyword = useDebounce(keyword, 400);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Check following or not
  useEffect(() => {
    const fetchFollowStatus = async () => {
      if (!popoverUser?._id) return;

      try {
        const data = await checkIsFollowing(popoverUser?._id);
        setIsFollowing(data.result.isFollowing);
      } catch (error: any) {
        console.log("Failed to fetch follow status", error.message);
      }
    };

    fetchFollowStatus();
  }, [popoverUser?._id]);

  useEffect(() => {
    fetchSearchUsers(false);
  }, [debouncedKeyword, fetchSearchUsers, selectedFilter]);

  const handleLoadMore = async () => {
    if (hasMore && !isPaging && !isLoading) {
      await fetchSearchUsers(true);
    }
  };

  const handleResult = async (user: User) => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setLoading(true);

    try {
      const response = await createOrOpen({ userId: user._id });
      const chat = response.data.result;
      console.log("response", response.status);
      console.log("chat", chat._id);
      const existchat = getChatById(chat._id);
      console.log("existchat", existchat?._id);

      if (response.status === 200 && !getChatById(chat._id)) {
        console.log("no caht found added new chat");

        setChats([chat]);
        console.log(response.status);
      } else if (response.status === 201) {
        setChats([chat]);
      }

      router.push({
        pathname: "/(chat)",
        params: { chatId: chat._id },
      });
    } catch (error: any) {
      ToastAndroid.show(error.message, ToastAndroid.SHORT);
    } finally {
      // Wait a bit to allow navigation to settle
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 1000); // consistent delay for all cases
      setLoading(false);
    }
  };

  if (!user) return null;

  const filterTypes = ["All", "Online", "Male", "Female", "Group"];
  const filteredResults =
    selectedFilter === "Online"
      ? results.filter((u) => onlineUserIds.includes(u._id))
      : results;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: color.primaryBackground }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ThemedView style={styles.header}>
        <ThemedView style={styles.inputContainer}>
          <ThemedView
            style={[
              styles.inputTextContainer,
              { backgroundColor: color.secondaryBackground },
            ]}
          >
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons
                name="chevron-back-outline"
                size={22}
                color={color.primaryIcon}
              />
            </TouchableOpacity>
            <TextInput
              ref={inputRef}
              value={keyword}
              onChangeText={setKeyword}
              placeholder="Search"
              placeholderTextColor="gray"
              style={[styles.textInput, { color: color.primaryText }]}
            />
            <TouchableOpacity onPress={() => console.log("QR scan")}>
              <MaterialCommunityIcons
                name="line-scan"
                size={22}
                color={color.primaryIcon}
              />
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <ThemedView
        style={[
          styles.filterContainer,
          { borderBottomColor: color.primaryBorder },
        ]}
      >
        {filterTypes.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              { borderColor: color.secondaryBorder },
              selectedFilter === filter && {
                backgroundColor: color.primaryText,
              },
            ]}
            disabled={selectedFilter === filter}
            onPress={() => setSelectedFilter(filter)}
          >
            <ThemedText
              type="small"
              style={[
                {
                  color:
                    selectedFilter === filter
                      ? color.primaryBackground
                      : color.primaryText,
                },
              ]}
            >
              {filter}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ThemedView>

      <FlatList
        data={filteredResults}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          let isOnline = false;
          const otherUserId = item._id !== user._id ? item._id : null;
          if (otherUserId) isOnline = onlineUserIds.includes(otherUserId);
          return (
            <UserItem
              user={item}
              isOnline={isOnline}
              disabled={loading}
              joinedAt={item.createdAt}
              onPress={() => handleResult(item)}
              onPressMore={() => setPopoverUser(item)}
              moreButtonRef={
                moreButtonRefs.current[item._id] ||
                (moreButtonRefs.current[item._id] = React.createRef())
              }
            />
          );
        }}
        ListEmptyComponent={
          debouncedKeyword && !isLoading ? (
            <ThemedText style={{ textAlign: "center", marginVertical: 10 }}>
              No results found!
            </ThemedText>
          ) : null
        }
        style={styles.resultList}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={1}
        ListFooterComponent={
          hasMore && results.length > 0 && isPaging ? (
            <ActivityIndicator size="small" color={color.primaryIcon} />
          ) : null
        }
      />

      {/* Popover */}
      <UserPopoverMenu
        user={popoverUser}
        fromRef={moreButtonRefs.current[popoverUser?._id ?? ""]}
        onRequestClose={() => setPopoverUser(null)}
        options={[
          isFollowing
            ? {
                label: "Unfollow",
                icon: "person-remove-outline",
                destructive: true,
                onPress: () => {
                  Alert.alert("Unfollow", `Unfollow ${popoverUser?.name}?`, [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Unfollow",
                      style: "destructive",
                      onPress: async () => {
                        try {
                          setPopoverUser(null);
                          const data = await unfollow(popoverUser?._id);

                          ToastAndroid.show(data.message, ToastAndroid.SHORT);
                        } catch (error) {
                          console.log("Failed to unfollow", error);
                        }
                      },
                    },
                  ]);
                },
              }
            : {
                label: "Follow",
                icon: "person-add-outline",
                onPress: async () => {
                  try {
                    const data = await follow(popoverUser?._id);
                    setPopoverUser(null);

                    ToastAndroid.show(data.message, ToastAndroid.SHORT);
                  } catch (error) {
                    console.log("Failed to follow", error);
                  }
                },
              },

          // Block
          {
            label: "Block",
            icon: "remove-circle-outline",
            onPress: () => {
              Alert.alert(
                "Block",
                `Are your sure you want to block ${popoverUser?.name}?`,
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Block",
                    style: "destructive",
                    onPress: async () => {
                      try {
                        setPopoverUser(null);
                        const data = await block(popoverUser?._id);

                        ToastAndroid.show(data.message, ToastAndroid.SHORT);
                      } catch (error) {
                        console.log("Failed to block", error);
                      }
                    },
                  },
                ]
              );
            },
            destructive: true,
          },
        ]}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  inputTextContainer: {
    height: 40,
    width: "95%",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  textInput: {
    flex: 1,
    paddingBottom: 0,
    paddingTop: 0,
    height: "100%",
    paddingLeft: 20,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 30,
    borderBottomWidth: 0.4,
    paddingBottom: 10,
  },
  filterButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 0.5,
    marginHorizontal: 3,
  },
  resultList: { flex: 1 },
});
