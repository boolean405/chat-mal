import React from "react";
import { Image } from "expo-image";
import { StyleSheet, TouchableOpacity, useColorScheme } from "react-native";

import { Story } from "@/types";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/colors";

export default function StoryItem({
  story,
  onPress,
}: {
  story: Story;
  onPress: () => void;
}) {
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];
  return (
    <TouchableOpacity style={styles.storyItem} onPress={onPress}>
      <ThemedView
        style={[
          styles.storyAvatarWrapper,
          story.hasStory && styles.storyAvatarBorder,
          { borderColor: color.storyBorder },
        ]}
      >
        <Image source={{ uri: story.storyUri }} style={styles.storyAvatar} />
      </ThemedView>
      <ThemedText style={styles.storyName} numberOfLines={1}>
        {story.name}
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
  storyAvatarBorder: {
    borderWidth: 2,
    // borderColor: "#25D366",
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
});
