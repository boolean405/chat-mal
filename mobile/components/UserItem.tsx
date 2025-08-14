import React from "react";
import {
  TouchableOpacity,
  Image,
  StyleSheet,
  useColorScheme,
} from "react-native";

import { User } from "@/types";
import { Colors } from "@/constants/colors";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import getLastTime from "@/utils/getLastTime";

interface Props {
  user: User;
  joinedAt?: Date;
  moreButtonRef?: React.RefObject<any>;
  tag?: string;
  isSelf?: boolean;
  isOnline?: boolean;
  disabled: boolean;
  onPress?: () => void;
  onPressMore?: () => void;
}

const UserItem: React.FC<Props> = ({
  user,
  joinedAt,
  isOnline,
  moreButtonRef,
  tag,
  disabled,
  isSelf,
  onPress,
  onPressMore,
}) => {
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={disabled}
    >
      <ThemedView style={styles.profilePhotoContainer}>
        <Image
          source={{ uri: user.profilePhoto }}
          style={[styles.profilePhoto, { borderColor: color.secondaryBorder }]}
        />
        {tag && (
          <ThemedView style={styles.tagBadge}>
            <ThemedText style={styles.tagBadgeText}>{tag}</ThemedText>
          </ThemedView>
        )}

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
      <ThemedView style={styles.textContainer}>
        <ThemedText type="defaultBold" numberOfLines={1}>
          {user.name}
          {isSelf && " (me)"}
          {tag && ` ${tag}`}
        </ThemedText>

        <ThemedText type="small" style={{ fontStyle: "italic" }}>
          {user.username && `@${user.username}`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.dateContainer}>
        <ThemedText type="smaller" style={{ color: "gray", marginRight: 5 }}>
          {joinedAt &&
            `Joined at: ${new Date(joinedAt).getDate()}/${
              new Date(joinedAt).getMonth() + 1
            }/${new Date(joinedAt).getFullYear()}`}{" "}
        </ThemedText>
        {onPressMore && (
          <TouchableOpacity
            onPress={onPressMore}
            ref={moreButtonRef}
            disabled={disabled}
          >
            <Ionicons
              name="ellipsis-vertical-outline"
              size={20}
              color={color.primaryIcon}
            />
          </TouchableOpacity>
        )}
      </ThemedView>
    </TouchableOpacity>
  );
};

export default UserItem;

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
  dateContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    // alignContent: "center",
    alignItems: "center",
  },
  profilePhotoContainer: {
    position: "relative",
    // marginRight: 15,
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
    borderRadius: 10,
    fontSize: 6,
    textAlign: "center",
    textAlignVertical: "center",
  },
  tagBadge: {
    position: "absolute",
    top: 0,
    right: 13,
    backgroundColor: "rgba(0, 0, 0, 0)",
    // alignItems: "center",
    // justifyContent: "center",
  },
  tagBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },

  // iconContainer: {
  //   marginRight: 10,
  // },
});
