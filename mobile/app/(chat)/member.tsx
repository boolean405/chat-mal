import {
  TouchableOpacity,
  KeyboardAvoidingView,
  useColorScheme,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import Popover from "react-native-popover-view";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import UserItem from "@/components/UserItem";
import { Chat, User } from "@/types";
import { ToastAndroid } from "react-native";
import SelectableUserItem from "@/components/user/SelectableUserItem";
import { useUsersSearchStore } from "@/stores/usersSearchStore";
import useDebounce from "@/hooks/useDebounce";
import { addUsersToGroup } from "@/api/chat";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";

export default function Member() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];

  const user = useAuthStore((state) => state.user);
  const { getChatById } = useChatStore();

  const { chatId: rawChatId } = useLocalSearchParams();
  const chatId = Array.isArray(rawChatId) ? rawChatId[0] : rawChatId;
  const chat = getChatById(chatId);

  const {
    results,
    page,
    keyword,
    selectedFilter,
    hasMore,
    isLoading,
    isPaging,
    errorMessage,
    setKeyword,
    setSelectedFilter,
    fetchSearchUsers,
  } = useUsersSearchStore();

  const [isAddMode, setIsAddMode] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [popoverUserId, setPopoverUserId] = useState<string | null>(null);
  const moreButtonRefs = useRef<{ [key: string]: React.RefObject<any> }>({});

  const debouncedKeyword = useDebounce(keyword, 400);

  useEffect(() => {
    fetchSearchUsers(false);
  }, [debouncedKeyword, selectedFilter]);

  if (!user || !chat) return null;

  const handleMembers = (user: User) => {
    console.log(user.name);
  };

  // Handle invite members
  const handleAddMembers = async () => {
    // Api call
    try {
      const data = await addUsersToGroup(
        chatId,
        selectedUsers.map((u) => u._id)
      );
      if (data.status) {
        ToastAndroid.show(data.message, ToastAndroid.SHORT);
        setIsAddMode(false);
        setSelectedUsers([]);
      }
    } catch (err: any) {
      ToastAndroid.show(err.message, ToastAndroid.SHORT);
    }
  };

  const handleLoadMore = async () => {
    if (hasMore && !isPaging && !isLoading) {
      await fetchSearchUsers(true);
    }
  };

  const handleResult = async (user: any) => {
    try {
      // const data = await createOrOpen(user._id);
      // router.push({
      //   pathname: "/(chat)",
      //   params: { chatId: data.result._id },
      // });
    } catch (err: any) {
      // ToastAndroid.show(err.message, ToastAndroid.SHORT);
    }
  };

  const existingUserIds = new Set([
    ...chat!.users.map((u) => u.user._id),
    ...chat!.groupAdmins.map((a) => a.user._id),
  ]);

  const filteredResults = results.filter(
    (user) => !existingUserIds.has(user._id)
  );

  const filterByKeyword = (
    users: typeof chat.groupAdmins | typeof chat.users,
    keyword: string
  ) => {
    if (!keyword.trim()) return users;
    return users.filter(({ user }) =>
      user.name.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  const adminUserIds = new Set(chat.groupAdmins.map((a) => a.user._id));

  const filteredAdmins = chat ? filterByKeyword(chat.groupAdmins, keyword) : [];
  const filteredUsers = chat
    ? filterByKeyword(
        chat.users.filter(({ user }) => !adminUserIds.has(user._id)),
        keyword
      )
    : [];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: color.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      {/* Header */}
      <ThemedView style={[styles.header, { borderBottomColor: color.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={22} color={color.icon} />
        </TouchableOpacity>
        <ThemedView style={styles.HeaderTitleContainer}>
          <ThemedText type="subtitle">Members</ThemedText>
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
            <Ionicons name="person-add-outline" size={22} color={color.icon} />
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
                <Ionicons name="people-outline" size={22} color={color.icon} />
                <ThemedText style={{ marginLeft: 10 }}>
                  Add members to group
                </ThemedText>
              </ThemedView>
            }
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={1}
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
        // Admin
        <FlatList
          data={filteredAdmins}
          keyExtractor={(item) => item.user._id}
          renderItem={({ item }) => {
            const isInitiator = item.user._id === chat.initiator._id;
            const adminTag = isInitiator ? "👑" : "🛡️";
            return (
              <UserItem
                user={item.user}
                chatJoinedAt={item.joinedAt}
                tag={adminTag}
                onPress={() => {
                  handleMembers(item.user);
                }}
                onPressMore={() => setPopoverUserId(item.user._id)}
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
          // onEndReached={handleLoadMore}
          onEndReachedThreshold={1}
          ListHeaderComponent={
            <ThemedView
              style={[styles.titleTextContainer, { borderColor: color.border }]}
            >
              <Ionicons name="laptop-outline" size={22} color={color.icon} />
              <ThemedText style={{ marginLeft: 10 }}>Admins</ThemedText>
            </ThemedView>
          }
          ListFooterComponent={
            // Users
            <FlatList
              data={filteredUsers}
              keyExtractor={(item) => item.user._id}
              renderItem={({ item }) => (
                <UserItem
                  user={item.user}
                  chatJoinedAt={item.joinedAt}
                  tag="🍀"
                  onPress={() => {
                    handleMembers(item.user);
                  }}
                  onPressMore={() => setPopoverUserId(item.user._id)}
                  moreButtonRef={
                    moreButtonRefs.current[item.user._id] ||
                    (moreButtonRefs.current[item.user._id] = React.createRef())
                  }
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
                  <ThemedText style={{ marginLeft: 10 }}>Members</ThemedText>
                </ThemedView>
              }
              style={styles.resultList}
              showsVerticalScrollIndicator={false}
              // onEndReached={handleLoadMore}
              onEndReachedThreshold={0.1}
              // ListFooterComponent={
              //   hasMore && results.length > 0 && isPaging ? (
              //     <ActivityIndicator size="small" color={color.icon} />
              //   ) : null
              // }
            />
          }
        />
      )}

      {popoverUserId && (
        <Popover
          isVisible={!!popoverUserId}
          onRequestClose={() => setPopoverUserId(null)}
          from={moreButtonRefs.current[popoverUserId]}
          popoverStyle={{
            backgroundColor: color.secondary,
          }}
        >
          {(() => {
            const isCreator = chat.initiator._id === user?._id;
            const isAdmin = chat.groupAdmins.some(
              (a) => a.user._id === user?._id
            );
            const currentUserRole = isCreator
              ? "creator"
              : isAdmin
              ? "admin"
              : "member";

            const isTargetAdmin = chat.groupAdmins.some(
              (a) => a.user._id === popoverUserId
            );
            const isTargetCreator = chat.initiator._id === popoverUserId;

            const isSelf = user?._id === popoverUserId;

            const options = [];

            // 👇👇👇 Only show "Leave Group" if user clicked themselves
            if (isSelf) {
              return (
                <TouchableOpacity
                  onPress={() => {
                    ToastAndroid.show("Leave Group", ToastAndroid.SHORT);
                    setPopoverUserId(null);
                    // 👉 Here you could also call a leaveGroup() function
                  }}
                >
                  <ThemedText style={{ padding: 10 }}>Leave Group</ThemedText>
                </TouchableOpacity>
              );
            }

            // Everyone can PM
            options.push(
              <TouchableOpacity
                key="pm"
                onPress={() => {
                  ToastAndroid.show("PM Chat", ToastAndroid.SHORT);
                  setPopoverUserId(null);
                }}
              >
                <ThemedText style={{ padding: 10 }}>PM Chat</ThemedText>
              </TouchableOpacity>
            );

            if (currentUserRole === "creator") {
              if (isTargetAdmin && !isTargetCreator) {
                options.unshift(
                  <TouchableOpacity
                    key="removeAdmin"
                    onPress={() => {
                      ToastAndroid.show(
                        "Remove from group",
                        ToastAndroid.SHORT
                      );
                      setPopoverUserId(null);
                    }}
                  >
                    <ThemedText style={{ padding: 10 }}>
                      Remove from group
                    </ThemedText>
                  </TouchableOpacity>
                );
              }
              if (!isTargetAdmin) {
                options.unshift(
                  <TouchableOpacity
                    key="makeAdmin"
                    onPress={() => {
                      ToastAndroid.show("Make Admin", ToastAndroid.SHORT);
                      setPopoverUserId(null);
                    }}
                  >
                    <ThemedText style={{ padding: 10 }}>Make Admin</ThemedText>
                  </TouchableOpacity>,
                  <TouchableOpacity
                    key="removeUser"
                    onPress={() => {
                      ToastAndroid.show(
                        "Remove from group",
                        ToastAndroid.SHORT
                      );
                      setPopoverUserId(null);
                    }}
                  >
                    <ThemedText style={{ padding: 10 }}>
                      Remove from group
                    </ThemedText>
                  </TouchableOpacity>
                );
              }
            } else if (currentUserRole === "admin") {
              if (isTargetAdmin && !isTargetCreator) {
                options.unshift(
                  <TouchableOpacity
                    key="removeAdminByAdmin"
                    onPress={() => {
                      ToastAndroid.show(
                        "Remove from group",
                        ToastAndroid.SHORT
                      );
                      setPopoverUserId(null);
                    }}
                  >
                    <ThemedText style={{ padding: 10 }}>
                      Remove from group
                    </ThemedText>
                  </TouchableOpacity>
                );
              }
              if (!isTargetAdmin) {
                options.unshift(
                  <TouchableOpacity
                    key="makeAdminByAdmin"
                    onPress={() => {
                      ToastAndroid.show("Make Admin", ToastAndroid.SHORT);
                      setPopoverUserId(null);
                    }}
                  >
                    <ThemedText style={{ padding: 10 }}>Make Admin</ThemedText>
                  </TouchableOpacity>,
                  <TouchableOpacity
                    key="removeUserByAdmin"
                    onPress={() => {
                      ToastAndroid.show(
                        "Remove from group",
                        ToastAndroid.SHORT
                      );
                      setPopoverUserId(null);
                    }}
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
    borderBottomWidth: 0.2,
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
