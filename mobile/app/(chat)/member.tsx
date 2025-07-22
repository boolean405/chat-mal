import {
  TouchableOpacity,
  KeyboardAvoidingView,
  useColorScheme,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  ToastAndroid,
} from "react-native";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import Popover from "react-native-popover-view";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import UserItem from "@/components/UserItem";
import { Chat, User } from "@/types";
import SelectableUserItem from "@/components/user/SelectableUserItem";
import { useUsersSearchStore } from "@/stores/usersSearchStore";
import useDebounce from "@/hooks/useDebounce";
import {
  addAdminToGroup,
  addUsersToGroup,
  createOrOpen,
  leaveGroup,
  removeAdminFromGroup,
  removeUserFromGroup,
} from "@/api/chat";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { useMessageStore } from "@/stores/messageStore";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Member() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];

  const isNavigatingRef = useRef(false);

  const [isAddMode, setIsAddMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [popoverUser, setPopoverUser] = useState<User | null>(null);
  const moreButtonRefs = useRef<{ [key: string]: React.RefObject<any> }>({});

  const { user } = useAuthStore();
  const { clearMessages } = useMessageStore();
  const { onlineUserIds, getChatById, clearChat, updateChat, setChats } =
    useChatStore();

  const { chatId: rawChatId } = useLocalSearchParams();
  const chatId = Array.isArray(rawChatId) ? rawChatId[0] : rawChatId;
  const chat = getChatById(chatId);

  const {
    results,
    page,
    keyword,
    selectedFilter,
    hasMore,
    isLoading: loading,
    isPaging,
    errorMessage,
    setKeyword,
    setSelectedFilter,
    fetchSearchUsers,
  } = useUsersSearchStore();

  const debouncedKeyword = useDebounce(keyword, 400);

  useEffect(() => {
    fetchSearchUsers(false);
  }, [debouncedKeyword, selectedFilter]);

  useEffect(() => {
    if (!isAddMode) setKeyword(""); // clear when exiting add mode
  }, [isAddMode]);

  const filteredResults = useMemo(() => {
    const existingUserIds = new Set(chat?.users?.map((u) => u.user._id) ?? []);
    return results.filter((user) => !existingUserIds.has(user._id));
  }, [results, chat]);

  const filterByKeyword = (
    users: {
      user: User;
      joinedAt: Date;
      role: "leader" | "admin" | "member";
    }[],
    keyword: string
  ) => {
    if (!keyword.trim()) return users;
    return users.filter(({ user }) => {
      const lower = keyword.toLowerCase();
      return (
        user.name.toLowerCase().includes(lower) ||
        user.username?.toLowerCase().includes(lower)
      );
    });
  };

  // 🔎 Keyword filter on all remaining (non-admin) members
  const filteredMembers = useMemo(() => {
    const sorted = [...(chat?.users ?? [])].sort((a, b) => {
      const rank = { leader: 0, admin: 1, member: 2 };
      return rank[a.role] - rank[b.role];
    });

    return filterByKeyword(sorted, keyword);
  }, [chat?.users, keyword]);

  if (!user || !chat) return null;

  // Load more
  const handleLoadMore = async () => {
    if (hasMore && !isPaging && !loading) {
      await fetchSearchUsers(true);
    }
  };

  // Handle invite members
  const handleAddMembers = async () => {
    setIsLoading(true);
    // Api call
    try {
      const userIds = selectedUsers.map((u) => u._id);
      const data = await addUsersToGroup(chatId, userIds);
      if (data.status) {
        updateChat(data.result);
        setIsAddMode(false);
        setSelectedUsers([]);
        ToastAndroid.show(data.message, ToastAndroid.SHORT);
      }
    } catch (err: any) {
      ToastAndroid.show(err.message, ToastAndroid.SHORT);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle make admin
  const handleMakeAdmin = async () => {
    Alert.alert(
      "Make Admin",
      `Are you sure you want to make '${popoverUser?.name}' to be an admin?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: async () => {
            setIsLoading(true);
            setPopoverUser(null);
            // Api call
            try {
              const data = await addAdminToGroup(
                chatId,
                popoverUser?._id.toString()
              );
              if (data.status) {
                updateChat(data.result);
                ToastAndroid.show(data.message, ToastAndroid.SHORT);
              }
            } catch (err: any) {
              ToastAndroid.show(err.message, ToastAndroid.SHORT);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  // Handle remove admin
  const handleRemoveAdmin = async () => {
    Alert.alert(
      "Remove Admin Role",
      `Are you sure you want remove '${popoverUser?.name}' from an admin?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            setPopoverUser(null);
            // Api call
            try {
              const data = await removeAdminFromGroup(chatId, popoverUser?._id);
              if (data.status) {
                updateChat(data.result);
                ToastAndroid.show(data.message, ToastAndroid.SHORT);
              }
            } catch (err: any) {
              ToastAndroid.show(err.message, ToastAndroid.SHORT);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  // Handle remove admin
  const handleRemoveUser = async () => {
    Alert.alert(
      "Remove Member",
      `Are you sure you want remove '${popoverUser?.name}' from the group?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            setPopoverUser(null);
            // Api call
            try {
              const data = await removeUserFromGroup(chatId, popoverUser?._id);
              if (data.status) {
                updateChat(data.result);
                ToastAndroid.show(data.message, ToastAndroid.SHORT);
              }
            } catch (err: any) {
              ToastAndroid.show(err.message, ToastAndroid.SHORT);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  // Handle leave group
  const handleLeaveGroup = async () => {
    Alert.alert("Leave Group", `Are you sure you want to leave the group?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Leave",
        style: "destructive",
        onPress: async () => {
          setIsLoading(true);
          setPopoverUser(null);
          // Api call
          try {
            const data = await leaveGroup(chatId); // no result
            if (data.status) {
              clearChat(chatId);
              clearMessages(chatId);
              ToastAndroid.show(data.message, ToastAndroid.SHORT);
              router.replace("/(tab)");
            }
          } catch (err: any) {
            ToastAndroid.show(err.message, ToastAndroid.SHORT);
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  const handleItemPress = async (user: User) => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setIsLoading(true);
    setPopoverUser(null);

    // Api call
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
      // Wait a bit to allow navigation to settle
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 1000); // consistent delay for all cases
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: color.background }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        {/* Header */}
        <ThemedView
          style={[styles.header, { borderBottomColor: color.border }]}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons
              name="chevron-back-outline"
              size={22}
              color={color.icon}
            />
          </TouchableOpacity>
          <ThemedView style={styles.HeaderTitleContainer}>
            <ThemedText type="headerTitle">Members</ThemedText>
          </ThemedView>

          {/* Add members */}
          {isAddMode ? (
            <TouchableOpacity
              onPress={() => {
                setIsAddMode(false);
                setSelectedUsers([]);
              }}
            >
              <Ionicons name="close-outline" size={22} color="red" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setIsAddMode(true)}>
              <Ionicons
                name="person-add-outline"
                size={22}
                color={color.icon}
              />
            </TouchableOpacity>
          )}
        </ThemedView>

        <ThemedView style={[styles.searchContainer]}>
          <ThemedView style={[styles.inputContainer]}>
            <ThemedView
              style={[
                styles.inputTextContainer,
                { backgroundColor: color.secondary },
              ]}
            >
              <TouchableOpacity>
                <Ionicons name="search-outline" size={22} color={color.icon} />
              </TouchableOpacity>
              <TextInput
                // ref={inputRef} // Step 3: Attach ref
                value={keyword}
                style={[styles.textInput, { color: color.text }]}
                placeholder="Search"
                placeholderTextColor="gray"
                onChangeText={(text) => {
                  const sanitized = text.replace(/^\s+/, "");
                  setKeyword(sanitized);
                }}
              />
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {isAddMode ? (
          // Add members
          <ThemedView style={{ flex: 1 }}>
            <FlatList
              data={filteredResults}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <SelectableUserItem
                  user={item}
                  selected={selectedUsers.some((u) => u._id === item._id)}
                  onSelect={() => {
                    setSelectedUsers((prev) =>
                      prev.some((u) => u._id === item._id)
                        ? prev.filter((u) => u._id !== item._id)
                        : [...prev, item]
                    );
                  }}
                />
              )}
              ListHeaderComponent={
                <ThemedView
                  style={[
                    styles.titleTextContainer,
                    { borderColor: color.border },
                  ]}
                >
                  <Ionicons
                    name="people-outline"
                    size={22}
                    color={color.icon}
                  />
                  <ThemedText style={{ marginLeft: 10 }}>
                    Add members to group
                  </ThemedText>
                </ThemedView>
              }
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.1}
              ListFooterComponent={
                hasMore && results.length > 0 && isPaging ? (
                  <ActivityIndicator size="small" color={color.icon} />
                ) : null
              }
            />

            {/* Add to Group Button */}
            {selectedUsers.length > 0 && (
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: color.primary }]}
                onPress={handleAddMembers}
              >
                <ThemedText
                  type="defaultBold"
                  style={{ color: color.background }}
                >
                  Add {selectedUsers.length} member
                  {selectedUsers.length > 1 ? "s" : ""}
                </ThemedText>
              </TouchableOpacity>
            )}
          </ThemedView>
        ) : (
          // All members
          <FlatList
            data={filteredMembers}
            keyExtractor={(item) => item.user._id}
            renderItem={({ item }) => {
              const isOnline = onlineUserIds.includes(item.user._id);
              const tag =
                item.role === "leader"
                  ? "👑"
                  : item.role === "admin"
                  ? "🛡️"
                  : "🍀";

              const isSelf = item.user._id === user._id;
              return (
                <UserItem
                  user={item.user}
                  isSelf={isSelf}
                  isOnline={isOnline}
                  disabled={loading}
                  chatJoinedAt={item.joinedAt}
                  tag={tag}
                  onPress={
                    isSelf ? undefined : () => handleItemPress(item.user)
                  }
                  onPressMore={() => setPopoverUser(item.user)}
                  moreButtonRef={
                    moreButtonRefs.current[item.user._id] ||
                    (moreButtonRefs.current[item.user._id] = React.createRef())
                  }
                />
              );
            }}
            style={styles.resultList}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.1}
            ListHeaderComponent={
              <ThemedView
                style={[
                  styles.titleTextContainer,
                  { borderColor: color.border },
                ]}
              >
                <Ionicons name="people-outline" size={22} color={color.icon} />
                <ThemedText style={{ marginLeft: 10 }}>
                  Group Members
                </ThemedText>
              </ThemedView>
            }
          />
        )}

        {popoverUser && (
          <Popover
            isVisible={!!popoverUser}
            onRequestClose={() => setPopoverUser(null)}
            from={moreButtonRefs.current[popoverUser._id]}
            popoverStyle={{
              backgroundColor: color.secondary,
            }}
          >
            {(() => {
              const isLeader = chat.users.some(
                (a) => a.role === "leader" && a.user._id === user._id
              );
              const isAdmin = chat.users.some(
                (a) => a.role === "admin" && a.user._id === user._id
              );
              const currentUserRole = isLeader
                ? "leader"
                : isAdmin
                ? "admin"
                : "member";

              const isTargetAdmin = chat.users.some(
                (a) => a.role === "admin" && a.user._id === popoverUser._id
              );
              const isTargetLeader = chat.users.some(
                (a) => a.role === "leader" && a.user._id === popoverUser._id
              );
              const isSelf = user?._id === popoverUser._id;
              const options = [];

              // 👇👇👇 Only show "Leave Group" if user clicked themselves
              if (isSelf) {
                return (
                  <TouchableOpacity
                    onPress={handleLeaveGroup}
                    disabled={isLoading}
                  >
                    <ThemedText style={{ padding: 10 }}>Leave group</ThemedText>
                  </TouchableOpacity>
                );
              }

              // Everyone can PM
              options.push(
                <TouchableOpacity
                  key="pm"
                  disabled={isLoading}
                  onPress={() => handleItemPress(popoverUser)}
                >
                  <ThemedText style={{ padding: 10 }}>PM Chat</ThemedText>
                </TouchableOpacity>
              );

              if (currentUserRole === "leader") {
                if (isTargetAdmin && !isTargetLeader) {
                  options.unshift(
                    <TouchableOpacity
                      key="removeAdmin"
                      disabled={isLoading}
                      onPress={handleRemoveAdmin}
                    >
                      <ThemedText style={{ padding: 10 }}>
                        Remove admin role
                      </ThemedText>
                    </TouchableOpacity>
                  );
                }
                if (!isTargetAdmin) {
                  options.unshift(
                    <TouchableOpacity key="makeAdmin" onPress={handleMakeAdmin}>
                      <ThemedText style={{ padding: 10 }}>
                        Make admin
                      </ThemedText>
                    </TouchableOpacity>,
                    <TouchableOpacity
                      key="removeUser"
                      onPress={handleRemoveUser}
                      disabled={isLoading}
                    >
                      <ThemedText style={{ padding: 10 }}>
                        Remove from group
                      </ThemedText>
                    </TouchableOpacity>
                  );
                }
              } else if (currentUserRole === "admin") {
                // if (isTargetAdmin && !isTargetLeader) {
                //   options.unshift(
                //     <TouchableOpacity
                //       disabled={isLoading}
                //       key="removeAdminByAdmin"
                //       onPress={handleRemoveAdmin}
                //     >
                //       <ThemedText style={{ padding: 10 }}>
                //         Remove from group
                //       </ThemedText>
                //     </TouchableOpacity>
                //   );
                // }
                if (!isTargetAdmin && !isTargetLeader) {
                  options.unshift(
                    <TouchableOpacity
                      disabled={isLoading}
                      key="makeAdminByAdmin"
                      onPress={handleMakeAdmin}
                    >
                      <ThemedText style={{ padding: 10 }}>
                        Make admin
                      </ThemedText>
                    </TouchableOpacity>,
                    <TouchableOpacity
                      disabled={isLoading}
                      key="removeUserByAdmin"
                      onPress={handleRemoveUser}
                    >
                      <ThemedText style={{ padding: 10 }}>
                        Remove from group
                      </ThemedText>
                    </TouchableOpacity>
                  );
                }
              }

              return options;
            })()}
          </Popover>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingBottom: 50,
    // justifyContent: "center",
    // alignItems: "center",
  },
  header: {
    padding: 15,
    // paddingRight: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 0.4,
  },
  HeaderTitleContainer: {
    flex: 1,
    alignItems: "center",
    // marginRight: 20,
  },

  // here
  searchContainer: {
    // padding: 15,
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  resultList: { flex: 1 },

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
  filterButton: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
    // backgroundColor: "transparent",
    borderWidth: 0.5,
    marginHorizontal: 3,
  },
  filterText: {
    fontSize: 14,
  },
  titleTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 25,
    paddingVertical: 10,
    borderBottomWidth: 0.2,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 30,
    borderBottomWidth: 0.2,
    paddingBottom: 10,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 3,
  },
});
