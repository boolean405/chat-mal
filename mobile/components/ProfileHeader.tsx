import React from "react";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import {
  Image,
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
  useColorScheme,
} from "react-native";

interface Props {
  name: string;
  username: string;
  isOnline: boolean;
  profilePhoto: string;
  onUsernameCopied?: (text: string) => void;
  onPress?: () => void;
}

export const ProfileHeader: React.FC<Props> = ({
  name,
  username,
  isOnline,
  profilePhoto,
  onPress,
  onUsernameCopied,
}) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];

  const copyUsername = async () => {
    await Clipboard.setStringAsync(username);
    ToastAndroid.show("Username copied!", ToastAndroid.SHORT);
    if (onUsernameCopied) onUsernameCopied(username); // 🔥 Notify parent
  };

  return (
    <TouchableOpacity
      style={styles.profileRow}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <ThemedView
        style={[
          styles.profilePhotoContainer,
          {
            borderColor: color.secondaryBorder,
            backgroundColor: color.secondaryBackground,
          },
        ]}
      >
        {profilePhoto && (
          <Image source={{ uri: profilePhoto }} style={[styles.profilePhoto]} />
        )}
      </ThemedView>
      <ThemedView style={styles.profileInfo}>
        <ThemedView style={styles.profileHeader}>
          <ThemedView style={{ flex: 1 }}>
            <ThemedText
              type="subtitle"
              style={[styles.name, { color: color.primaryText }]}
            >
              {name}
            </ThemedText>
            <ThemedView style={styles.usernameRow}>
              <ThemedText style={[{ color: color.primaryIcon }]}>
                @{username}
              </ThemedText>
              <TouchableOpacity onPress={copyUsername}>
                <Ionicons
                  name="copy-outline"
                  size={15}
                  color={color.primaryIcon}
                  style={styles.copyIcon}
                />
              </TouchableOpacity>
            </ThemedView>
            <ThemedView style={styles.statusRow}>
              <ThemedView
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: isOnline
                      ? color.onlineBackground
                      : "#F44336",
                  },
                ]}
              />
              <ThemedText
                style={[
                  styles.statusText,
                  { color: isOnline ? color.onlineBackground : "#F44336" },
                ]}
              >
                {isOnline ? "Online" : "Offline"}
              </ThemedText>
            </ThemedView>
          </ThemedView>
          <TouchableOpacity
            onPress={() => router.push("/(setting)/edit-profile")}
          >
            <Ionicons
              name="create-outline"
              size={22}
              color={color.primaryIcon}
            />
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  profilePhotoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1,
    marginRight: 20,
    overflow: "hidden",
  },
  profilePhoto: {
    width: "100%",
    height: "100%",
    borderRadius: 45,
  },
  profileInfo: { flex: 1 },
  profileHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  name: {
    marginBottom: 2,
    fontWeight: "bold",
  },
  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  copyIcon: {
    marginLeft: 6,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
