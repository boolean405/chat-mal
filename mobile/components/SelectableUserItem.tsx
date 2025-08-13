import React from "react";
import {
  TouchableOpacity,
  Image,
  StyleSheet,
  useColorScheme,
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
  isOnline?: boolean;
}

const SelectableUserItem: React.FC<Props> = ({
  user,
  joinedAt,
  selected = false,
  onSelect,
  isOnline,
}) => {
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];

  return (
    <TouchableOpacity style={styles.container} onPress={onSelect}>
      {/* Profile Picture & Online Status */}
      <ThemedView style={styles.profilePhotoContainer}>
        <Image
          source={{ uri: user.profilePhoto }}
          style={[styles.profilePhoto, { borderColor: color.secondaryBorder }]}
        />

        {/* Online status */}
        {isOnline ? (
          <ThemedView
            style={[
              styles.onlineIndicator,
              {
                borderColor: color.onlineBorder,
                backgroundColor: color.onlineBackground,
              },
            ]}
          />
        ) : (
          <>
            {getLastTime(user.lastOnlineAt) === "0m" ? (
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
                {getLastTime(user.lastOnlineAt)}
              </ThemedText>
            )}
          </>
        )}
      </ThemedView>

      {/* Name & Username */}
      <ThemedView style={styles.textContainer}>
        <ThemedText type="defaultBold">{user.name}</ThemedText>
        {!!user.username && (
          <ThemedText type="small" style={{ fontStyle: "italic" }}>
            @{user.username}
          </ThemedText>
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
          color={color.primaryIcon}
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
    borderWidth: 0.5,
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
    // width: 12,
    // height: 10,
    paddingHorizontal: 2,
    borderWidth: 1.5,
    paddingVertical: 1,
    borderRadius: 8,
    fontSize: 6,
    textAlign: "center",
    textAlignVertical: "center",
  },
});
