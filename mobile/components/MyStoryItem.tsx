import { Image } from "expo-image";
import { StyleSheet, TouchableOpacity, useColorScheme } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/colors";
import { User } from "@/types";
import { Ionicons } from "@expo/vector-icons";

// My Story Item with + icon
export default function MyStoryItem({ user }: { user: User }) {
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];

  return (
    <TouchableOpacity
      style={styles.storyItem}
      onPress={() => alert("Coming soon!")}
    >
      <ThemedView
        style={[styles.storyAvatarWrapper, styles.myStoryAvatarWrapper]}
      >
        <Image
          source={{
            uri: user.profilePhoto,
          }}
          style={styles.storyAvatar}
        />
        <ThemedView
          style={[
            styles.plusIconWrapper,
            { backgroundColor: color.tertiaryBackground },
          ]}
        >
          <Ionicons name="add-outline" size={24} color={color.primary} />
        </ThemedView>
      </ThemedView>
      <ThemedText style={styles.storyName} numberOfLines={1}>
        My Story
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  storyItem: {
    width: 70,
    alignItems: "center",
    marginRight: 10,
  },
  storyAvatarWrapper: {
    borderRadius: 40,
    padding: 2,
  },
  myStoryAvatarWrapper: {
    borderWidth: 0,
    position: "relative",
  },
  storyAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ccc",
  },
  storyName: {
    marginTop: 4,
    fontSize: 12,
    maxWidth: 70,
    textAlign: "center",
  },
  plusIconWrapper: {
    position: "absolute",
    bottom: -2,
    right: -2,
    borderRadius: 15,
  },
});
