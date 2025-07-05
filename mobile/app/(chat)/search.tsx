import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
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

export default function Search() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];
  const { setChats, getChatById } = useChatStore();

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

  const debouncedKeyword = useDebounce(keyword, 400);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    fetchSearchUsers(false);
  }, [debouncedKeyword, selectedFilter]);

  const handleLoadMore = async () => {
    if (hasMore && !isPaging && !isLoading) {
      await fetchSearchUsers(true);
    }
  };

  const handleResult = async (user: User) => {
    try {
      const response = await createOrOpen(user._id);
      const chat = response.data.result;
      if (response.status === 200) {
        if (!getChatById(chat._id)) {
          setChats([chat]);
          console.log("added to chats");
        }
        router.push({
          pathname: "/(chat)",
          params: { chatId: chat._id },
        });
      } else if (response.status === 201) {
        setChats([response.data.result]);
        router.push({
          pathname: "/(chat)",
          params: { chatId: chat._id },
        });
      }
    } catch (err: any) {
      ToastAndroid.show(err.message, ToastAndroid.SHORT);
    }
  };

  const filterTypes = ["All", "Online", "Male", "Female", "Group"];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: color.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ThemedView style={styles.header}>
        <ThemedView style={styles.inputContainer}>
          <ThemedView
            style={[
              styles.inputTextContainer,
              { backgroundColor: color.secondary },
            ]}
          >
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons
                name="chevron-back-outline"
                size={22}
                color={color.icon}
              />
            </TouchableOpacity>
            <TextInput
              ref={inputRef}
              value={keyword}
              onChangeText={setKeyword}
              placeholder="Search"
              placeholderTextColor="gray"
              style={[styles.textInput, { color: color.text }]}
            />
            <TouchableOpacity onPress={() => console.log("QR scan")}>
              <MaterialCommunityIcons
                name="qrcode-scan"
                size={22}
                color={color.icon}
              />
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <ThemedView
        style={[
          styles.filterContainer,
          { borderBottomColor: color.borderColor },
        ]}
      >
        {filterTypes.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              { borderColor: color.borderColor },
              selectedFilter === filter && { backgroundColor: color.primary },
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <ThemedText
              style={[
                styles.filterText,
                {
                  color:
                    selectedFilter === filter ? color.background : color.text,
                },
              ]}
            >
              {filter}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ThemedView>

      {isLoading && (
        <ThemedText style={{ textAlign: "center", marginVertical: 10 }}>
          Searching...
        </ThemedText>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <UserItem user={item} onPress={() => handleResult(item)} />
        )}
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
            <ActivityIndicator size="small" color={color.icon} />
          ) : null
        }
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
    borderBottomWidth: 0.2,
    paddingBottom: 10,
  },
  filterButton: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 0.5,
    marginHorizontal: 3,
  },
  filterText: {
    fontSize: 14,
  },
  resultList: { flex: 1 },
});
