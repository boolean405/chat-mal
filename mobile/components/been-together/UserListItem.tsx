import React from "react";
import { Pressable, StyleSheet, useColorScheme } from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/colors";
import { User } from "@/types";
import { ThemedView } from "../ThemedView";
import getLastTime from "@/utils/getLastTime";

type Props = {
  user: User;
  onPress?: (user: User) => void;
};

export default function UserListItem({ user, onPress }: Props) {
  const scheme = useColorScheme();
  const color = Colors[scheme ?? "light"];

  const lastTime = getLastTime(user.lastOnlineAt);

  return (
    <Pressable
      onPress={() => onPress?.(user)}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}
    >
      {/* Profile photo + online/offline indicator */}
      <ThemedView style={styles.profilePhotoContainer}>
        <Image
          source={{ uri: user.profilePhoto }}
          style={[styles.profilePhoto, { borderColor: color.secondaryBorder }]}
        />

        {user.isOnline ? (
          <ThemedView
            style={[
              styles.onlineIndicator,
              {
                borderColor: color.onlineBorder,
                backgroundColor: color.onlineBackground,
              },
            ]}
          />
        ) : lastTime === "0m" ? (
          <ThemedView
            style={[
              styles.onlineIndicator,
              {
                borderColor: color.offlineBorder,
                backgroundColor: color.offlineBackground,
              },
            ]}
          />
        ) : (
          <ThemedText
            style={[
              styles.lastOnlineText,
              {
                color: color.primaryBackground,
                borderColor: color.offlineBorder,
                backgroundColor: color.offlineBackground,
              },
            ]}
          >
            {lastTime}
          </ThemedText>
        )}
      </ThemedView>

      {/* User info */}
      <ThemedView style={styles.textContainer}>
        <ThemedText type="defaultBold" numberOfLines={1}>
          {user.name}
        </ThemedText>
        {user.username && (
          <ThemedText type="small" style={{ fontStyle: "italic" }}>
            @{user.username}
          </ThemedText>
        )}
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  profilePhotoContainer: {
    position: "relative",
  },
  profilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
    borderWidth: 0.5,
  },
  textContainer: {
    flex: 1,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 15,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
  },
  lastOnlineText: {
    position: "absolute",
    bottom: 0,
    right: 15,
    fontWeight: "bold",
    paddingHorizontal: 2,
    paddingVertical: 1,
    borderWidth: 1.5,
    borderRadius: 10,
    fontSize: 6,
    textAlign: "center",
    textAlignVertical: "center",
  },
});
