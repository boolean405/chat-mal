import React, { useEffect, useMemo, useRef } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

import { User } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import useDebounce from "@/hooks/useDebounce";
import { useUsersSearchStore } from "@/stores/usersSearchStore";
import UserListItem from "./UserListItem";
import { ThemedView } from "../ThemedView";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (user: User) => void;
  currentUserId?: string;
};

export default function SelectUserModal({
  visible,
  currentUserId,
  onClose,
  onSelect,
}: Props) {
  const scheme = useColorScheme();
  const color = Colors[scheme ?? "light"];
  const inputRef = useRef<TextInput>(null);

  const {
    users,
    hasMore,
    isPaging,
    selectedFilter,
    keyword,
    isLoading,
    setKeyword,
    setSelectedFilter,
    resetSearch,
    fetchSearchUsers,
  } = useUsersSearchStore();

  const debounced = useDebounce(keyword, 400);

  useEffect(() => {
    return () => setKeyword("");
  }, [setKeyword]);

  // When modal opens
  useEffect(() => {
    if (!visible) return;
    resetSearch();
    fetchSearchUsers(false);
  }, [resetSearch, fetchSearchUsers]);

  // When keyword/filter changes
  useEffect(() => {
    if (!visible) return;
    fetchSearchUsers(false);
  }, [debounced, selectedFilter, visible, fetchSearchUsers]);

  const onEndReached = () => {
    if (!isPaging && hasMore) fetchSearchUsers(true);
  };

  const header = useMemo(
    () => (
      <ThemedView style={styles.searchContainer}>
        <ThemedView style={styles.inputContainer}>
          <ThemedView
            style={[
              styles.inputTextContainer,
              { backgroundColor: color.secondaryBackground },
            ]}
          >
            <TouchableOpacity>
              <Ionicons
                name="search-outline"
                size={22}
                color={color.primaryIcon}
              />
            </TouchableOpacity>

            <TextInput
              ref={inputRef}
              value={keyword}
              style={[styles.textInput, { color: color.primaryText }]}
              placeholder="Search"
              placeholderTextColor="gray"
              onChangeText={(text) => {
                const sanitized = text.replace(/^\s+/, "");
                setKeyword(sanitized);
              }}
            />

            {keyword.length > 0 && (
              <Pressable onPress={() => setKeyword("")} hitSlop={10}>
                <Ionicons
                  name="close-circle-outline"
                  size={20}
                  color={color.primaryIcon}
                />
              </Pressable>
            )}
          </ThemedView>
        </ThemedView>
      </ThemedView>
    ),
    [keyword, setKeyword, color]
  );

  const toolbar = (
    <View style={styles.toolbar}>
      <View style={styles.chipsRow}>
        {(["All", "Male", "Female"] as const).map((label) => {
          const active = selectedFilter === label;
          return (
            <Pressable
              key={label}
              onPress={() => setSelectedFilter(label)}
              style={[
                styles.chip,
                active && { backgroundColor: color.primaryButtonBackground },
                { borderColor: color.primaryBorder },
              ]}
            >
              <Ionicons
                name={
                  label === "Male"
                    ? "male-outline"
                    : label === "Female"
                    ? "female-outline"
                    : "people-outline"
                }
                size={14}
                color={active ? color.primaryBackground : color.primaryIcon}
              />
              <View style={{ width: 6 }} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <ThemedView style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.select({ ios: "padding", android: "height" })}
        >
          {/* Top bar */}
          <View style={styles.topBar}>
            <Pressable onPress={onClose} hitSlop={10} style={styles.iconBtn}>
              <Ionicons
                name="chevron-down-outline"
                size={24}
                color={color.primaryIcon}
              />
            </Pressable>
            <View style={{ flex: 1 }} />
          </View>

          {/* Search */}
          {header}

          {/* Filter chips */}
          {toolbar}

          {/* User list */}
          <FlatList
            data={users.filter((u) =>
              currentUserId ? u._id !== currentUserId : true
            )}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <UserListItem user={item} onPress={onSelect} />
            )}
            ItemSeparatorComponent={() => (
              <View
                style={{
                  height: StyleSheet.hairlineWidth,
                  backgroundColor: color.primaryBorder,
                  marginLeft: 72,
                  marginRight: 20,
                }}
              />
            )}
            onEndReachedThreshold={0.1}
            onEndReached={onEndReached}
            contentContainerStyle={{ paddingBottom: 24 }}
          />
        </KeyboardAvoidingView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingBottom: 6,
  },
  iconBtn: { paddingHorizontal: 10, paddingVertical: 10 },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 4,
    gap: 8,
  },
  chipsRow: { flexDirection: "row", gap: 8, flex: 1 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  searchContainer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "center",
    lineHeight: 22,
  },
  inputTextContainer: {
    height: 40,
    width: "100%",
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
});
