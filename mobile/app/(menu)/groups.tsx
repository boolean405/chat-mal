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
  useColorScheme,
  ToastAndroid,
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/stores/authStore";
import ChatItem from "@/components/ChatItem";
import { useGroupChatStore } from "@/stores/groupChatStore";
import Popover from "react-native-popover-view";
import { createOrOpen } from "@/api/chat";
import { useChatStore } from "@/stores/chatStore";
import ScreenHeader from "@/components/ScreenHeader";

export default function Groups() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];

  const isNavigatingRef = useRef(false);
  const inputRef = useRef<TextInput>(null);
  const filterIconRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const [isSortPopoverVisible, setSortPopoverVisible] = useState(false);

  const filterGroups = ["My groups", "Recommend", "Explore"] as const;
  const sortOptions = ["Active", "A-Z", "Z-A", "New", "Popular"] as const;

  const user = useAuthStore((state) => state.user);
  const { setChats, getChatById } = useChatStore();

  // Zustand state and actions
  const {
    groups,
    isLoading,
    hasMore,
    keyword,
    selectedType,
    selectedSort,
    // exit,
    setKeyword,
    setSelectedType,
    loadMore,
    setSelectedSort,
    reset,
    fetchGroups,
  } = useGroupChatStore();

  const debouncedKeyword = useDebounce(keyword, 300);

  // useEffect(() => {
  //   return () => {
  //     exit();
  //   };
  // }, [exit]);

  useEffect(() => {
    // reset(); // reset data on filter or keyword change
    fetchGroups(true); // fetch first page
  }, [selectedType, selectedSort, debouncedKeyword, reset, fetchGroups]);

  // Handler when user selects a sort option
  const onSelectSort = (option: (typeof sortOptions)[number]) => {
    setSelectedSort(option);
    setSortPopoverVisible(false);
  };

  // Handle press my group chat
  const handlePressMyGroupChat = async (chatId: string) => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setLoading(true);

    try {
      const response = await createOrOpen({ chatId });
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

  if (!user) return null;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: color.primaryBackground }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      {/* Header */}
      <ScreenHeader
        title="Groups"
        rightButton="Create"
        onRightPress={() => console.log("Create group clicked")}
      />

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
            <TouchableOpacity
              ref={filterIconRef}
              onPress={() => setSortPopoverVisible(true)}
            >
              <Ionicons
                name="filter-outline"
                size={22}
                color={color.primaryIcon}
              />
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Filter Group Buttons */}
      <ThemedView
        style={[
          styles.filterContainer,
          { borderBottomColor: color.primaryBorder },
        ]}
      >
        {filterGroups.map((filter) => (
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

      {/* Group chat list */}
      <FlatList
        data={groups}
        keyExtractor={(item) => item._id}
        style={styles.resultList}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        renderItem={({ item }) => {
          const isJoined = item.users.some(
            (u: any) => u.user._id === user._id || u.user === user._id
          );

          return (
            <ChatItem
              chat={item}
              disabled={isLoading || !isJoined}
              onPress={() => {
                if (isJoined) handlePressMyGroupChat(item._id);
              }}
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
        ListFooterComponent={
          hasMore && groups.length > 0 && isLoading ? (
            <ActivityIndicator size="small" color={color.primaryIcon} />
          ) : null
        }
      />

      {/* Sort Popover */}
      <Popover
        isVisible={isSortPopoverVisible}
        from={filterIconRef}
        onRequestClose={() => setSortPopoverVisible(false)}
        popoverStyle={{
          backgroundColor: color.secondaryBackground,
          paddingVertical: 5,
        }}
      >
        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => onSelectSort(option)}
            style={{ padding: 5, minWidth: 80, alignItems: "center" }}
          >
            <ThemedText
              style={{
                color: selectedSort === option ? color.primaryText : "gray",
                fontWeight: selectedSort === option ? "bold" : "normal",
              }}
            >
              {option}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </Popover>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  filterButton: {
    flex: 1, // make all buttons equal width
    alignItems: "center", // center text inside
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 0.5,
    marginHorizontal: 5, // spacing between buttons
  },
  resultList: { flex: 1 },
});
