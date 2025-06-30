import React from "react";
import {
  TouchableOpacity,
  Image,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";

import { Colors } from "@/constants/colors";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import getLastTime from "@/utils/getLastTime";
import { User } from "@/types";

interface Props {
  user: User;
  joinedAt?: Date;
  selected?: boolean;
  onSelect?: () => void;
}

const SelectableUserItem: React.FC<Props> = ({
  user,
  joinedAt,
  selected = false,
  onSelect,
}) => {
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];

  return (
    <TouchableOpacity style={styles.container} onPress={onSelect}>
      {/* Profile Picture & Online Status */}
      <ThemedView style={styles.profilePhotoContainer}>
        <Image
          source={{ uri: user.profilePhoto }}
          style={styles.profilePhoto}
        />
        {user.isOnline ? (
          <ThemedView style={styles.onlineIndicator} />
        ) : (
          <ThemedText type="extraSmallBold" style={styles.lastOnlineText}>
            {getLastTime(user.createdAt)}
          </ThemedText>
        )}
      </ThemedView>

      {/* Name & Username */}
      <ThemedView style={styles.textContainer}>
        <ThemedText type="defaultBold">{user.name}</ThemedText>
        {!!user.username && (
          <ThemedText type="smallItalic">@{user.username}</ThemedText>
        )}
      </ThemedView>

      {/* Join Date & Checkbox */}
      <ThemedView style={styles.rightSection}>
        {joinedAt && (
          <ThemedText type="small" style={{ color: "gray", marginRight: 10 }}>
            Joined: {new Date(joinedAt).getDate()}/
            {new Date(joinedAt).getMonth() + 1}/
            {new Date(joinedAt).getFullYear()}
          </ThemedText>
        )}
        <Ionicons
          name={selected ? "checkbox-outline" : "square-outline"}
          size={22}
          color={color.icon}
        />
      </ThemedView>
    </TouchableOpacity>
  );
};

export default SelectableUserItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: "center",
  },
  profilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  profilePhotoContainer: {
    position: "relative",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 15,
    width: 10,
    height: 10,
    backgroundColor: "limegreen",
    borderRadius: 5,
  },
  lastOnlineText: {
    position: "absolute",
    bottom: 0,
    right: 10,
    color: "gray",
  },
});
