import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "@/components/ScreenHeader";
import { SERVICE_MENUS } from "@/constants/data";
import ServiceItem from "@/components/ServiceItem";

export default function Services() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];

  const inputRef = useRef<TextInput>(null);
  const [keyword, setKeyword] = useState("");

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: color.primaryBackground }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      {/* Header */}
      <ScreenHeader title="Services" />

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

      <FlatList
        data={SERVICE_MENUS}
        keyExtractor={(item) => item.id}
        style={styles.resultList}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => {
          return (
            <ServiceItem
              item={item}
              onPress={() => router.push(`/(menu)/services${item.path}` as any)}
            />
          );
        }}
      />
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
  resultList: { flex: 1 },
  row: {
    justifyContent: "space-between", // evenly spread 2 cards
    paddingHorizontal: 20, // spacing from screen edge
  },
});
