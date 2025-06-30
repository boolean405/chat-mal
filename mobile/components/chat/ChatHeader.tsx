import React from "react";
import { useRouter } from "expo-router";
import {
  TouchableOpacity,
  FlatList,
  useColorScheme,
  StyleSheet,
  TextInput,
} from "react-native";

import { Story, User } from "@/types";
import { Colors } from "@/constants/colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
// import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import StoryItem from "@/components/StoryItem";
import MyStoryItem from "@/components/MyStoryItem";
import { ThemedView } from "@/components/ThemedView";

interface Props {
  stories: Story[];
  user: User | null;
}

export default function ChatHeader({ stories, user }: Props) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];
  return (
    <>
      {/* Search */}
      <TouchableOpacity
        onPress={() => router.push("/(chat)/search")}
        // activeOpacity={0.9}
      >
        <ThemedView
          style={[
            styles.inputContainer,
            {
              borderColor: color.borderColor,
              backgroundColor: color.secondary,
            },
          ]}
        >
          <Ionicons
            name="search-outline"
            size={22}
            style={{ color: color.icon }}
          />
          <TextInput
            style={[styles.textInput, { color: color.primary }]}
            placeholder="Search"
            placeholderTextColor="gray"
            editable={false}
            pointerEvents="none"
          />
          <TouchableOpacity onPress={() => console.log("Scan QR")}>
            <MaterialCommunityIcons
              name="qrcode-scan"
              size={22}
              color={color.icon}
            />
          </TouchableOpacity>
        </ThemedView>
      </TouchableOpacity>

      {/* Stories */}
      <FlatList
        data={stories}
        horizontal
        keyExtractor={(item) => item._id}
        showsHorizontalScrollIndicator={false}
        style={[styles.storyList, { borderBottomColor: color.borderColor }]}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        ListHeaderComponent={user && <MyStoryItem user={user} />}
        renderItem={({ item }) => (
          <StoryItem
            story={item}
            color={color}
            onPress={() => console.log(item.name)}
          />
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  // Stories
  storyList: {
    maxHeight: 110,
    paddingVertical: 10,
  },
  inputContainer: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 25,
    // borderWidth: 0.2,
    // width: "90%",
    paddingHorizontal: 20,
    marginVertical: 10,
    marginHorizontal: 20,
    height: 40,
  },
  textInput: {
    flex: 1,
    height: "100%",
    paddingTop: 0,
    paddingBottom: 0,
  },
});
