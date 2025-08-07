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
import { Ionicons } from "@expo/vector-icons";
import { User } from "@/types";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";
import { block, checkIsFollowing, follow, unfollow } from "@/api/user";
import UserPopoverMenu from "@/components/UserPopoverMenu";
import { useFollowStore } from "@/stores/followStore";

export default function Search() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];

  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 400);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [popoverUser, setPopoverUser] = useState<User | null>(null);
  const moreButtonRefs = useRef<{ [key: string]: React.RefObject<any> }>({});

  const isNavigatingRef = useRef(false);
  const filters = ["friends", "followers", "following"] as const;

  const user = useAuthStore((state) => state.user);
  const { setChats, getChatById, onlineUserIds } = useChatStore();

  const {
    users,
    selectedType,
    setSelectedType,
    fetchUsers,
    isLoading,
    hasMore,
  } = useFollowStore();

  useEffect(() => {
    fetchUsers(false, debouncedKeyword);
  }, [debouncedKeyword, fetchUsers, selectedType]);

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

  const handleResult = async (user: User) => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setLoading(true);

    try {
      const response = await createOrOpen(user._id);
      const chat = response.data.result;

      if (response.status === 200 && !getChatById(chat._id)) {
        setChats([chat]);
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
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 1000);
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      fetchUsers(true, debouncedKeyword);
    }
  };

  // For ui
  const removeUserFromList = (userId: string) => {
    // Assuming useFollowStore exposes a setter or you can patch state directly
    useFollowStore.setState((state) => ({
      users: state.users.filter((u) => u._id !== userId),
    }));
  };

  if (!user) return null;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: color.primaryBackground }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
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
        <ThemedView style={styles.headerTitleContainer}>
          <ThemedText type="headerTitle">Friends</ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Search Input */}
      <ThemedView style={styles.headerInputContainer}>
        <ThemedView style={styles.inputContainer}>
          <ThemedView
            style={[
              styles.inputTextContainer,
              { backgroundColor: color.secondaryBackground },
            ]}
          >
            <Ionicons
              name="search-outline"
              size={22}
              color={color.primaryIcon}
            />
            <TextInput
              ref={inputRef}
              value={keyword}
              onChangeText={setKeyword}
              placeholder="Search"
              placeholderTextColor="gray"
              style={[styles.textInput, { color: color.primaryText }]}
            />
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Filter Buttons */}
      <ThemedView
        style={[
          styles.filterContainer,
          { borderBottomColor: color.primaryBorder },
        ]}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              { borderColor: color.secondaryBorder },
              selectedType === filter && {
                backgroundColor: color.primaryText,
              },
            ]}
            onPress={() => setSelectedType(filter)}
            disabled={selectedType === filter}
          >
            <ThemedText
              type="small"
              style={{
                color:
                  selectedType === filter
                    ? color.primaryBackground
                    : color.primaryText,
              }}
            >
              {filter}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ThemedView>

      {/* User List */}
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          const isOnline = onlineUserIds.includes(item._id);
          return (
            <UserItem
              user={item}
              isOnline={isOnline}
              disabled={loading}
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
        onEndReachedThreshold={0.8}
        ListFooterComponent={
          hasMore && users.length > 0 && isLoading ? (
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

                          // Remove user from current list immediately
                          if (popoverUser?._id)
                            removeUserFromList(popoverUser._id);

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
          {
            label: "Block",
            icon: "remove-circle-outline",
            onPress: () => {
              Alert.alert(
                "Block",
                `Are you sure you want to block ${popoverUser?.name}?`,
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
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    marginRight: 22,
  },
  header: {
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 0.4,
  },
  headerInputContainer: {
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
