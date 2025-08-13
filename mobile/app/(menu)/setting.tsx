import React, { useRef, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  FlatList,
  Dimensions,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SETTINGS_MENUS } from "@/constants/data";
import { Colors } from "@/constants/colors";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import SettingMenuItem from "@/components/SettingMenuItem";
import { SettingMenuItem as ParentItem, SettingMenuChildItem } from "@/types";
import ScreenHeader from "@/components/ScreenHeader";

const screenWidth = Dimensions.get("window").width;
const CONTAINER_WIDTH = screenWidth * 0.9;

export default function Setting() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];

  const [keyword, setKeyword] = useState("");
  const inputRef = useRef<TextInput>(null);

  const filteredMenus = React.useMemo(() => {
    if (!keyword.trim()) return SETTINGS_MENUS;

    const lowerKeyword = keyword.toLowerCase();

    return SETTINGS_MENUS.filter((parent: ParentItem) => {
      // Match in parent title or desc
      const parentMatch =
        parent.title.toLowerCase().includes(lowerKeyword) ||
        parent.desc?.toLowerCase().includes(lowerKeyword);

      // Match in children
      const childMatch = parent.children?.some(
        (child: SettingMenuChildItem) =>
          child.title.toLowerCase().includes(lowerKeyword) ||
          child.path.toLowerCase().includes(lowerKeyword)
      );

      return parentMatch || childMatch;
    });
  }, [keyword]);

  const isSearching = keyword.trim().length > 0;

  return (
    <ThemedView style={{ flex: 1, backgroundColor: color.primaryBackground }}>
      {/* Header */}
      <ScreenHeader title="Settings" />

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

      {/* List */}
      <FlatList
        data={filteredMenus}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          return <SettingMenuItem item={item} forceExpand={isSearching} />;
        }}
        style={styles.container}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CONTAINER_WIDTH,
    alignSelf: "center",
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
});
