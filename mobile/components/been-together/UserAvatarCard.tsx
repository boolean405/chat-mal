import React from "react";
import { StyleSheet, TouchableOpacity, useColorScheme } from "react-native";
import { Image } from "expo-image";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { getAgeUTC, getZodiacUTC, ZODIAC_UNICODE } from "@/utils/ageZodiac";
import { User } from "@/types";

export default function UserAvatarCard({
  user,
  disabled,
  onPress,
}: {
  user?: User;
  disabled: boolean;
  onPress?: () => void;
}) {
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];

  const age = user?.birthday && getAgeUTC(user.birthday);
  const zodiacKey = user?.birthday && getZodiacUTC(user.birthday);

  return (
    <ThemedView style={styles.avatarContainer}>
      <TouchableOpacity onPress={onPress} disabled={disabled}>
        {/* Avatar image */}
        <ThemedView style={[styles.imageContainer, { borderColor: "#f7028e" }]}>
          <Image
            source={
              user?.profilePhoto
                ? { uri: user.profilePhoto }
                : require("@/assets/images/default-avatar.png")
            }
            contentFit="contain"
            style={styles.coverImage}
          />
        </ThemedView>
      </TouchableOpacity>

      {/* Name */}
      <ThemedText
        numberOfLines={1}
        type="large"
        style={{ marginVertical: 10 }}
        onPress={onPress}
      >
        {user?.name || "Choose partner"}
      </ThemedText>

      {/* Gender + Zodiac row */}
      {user && (
        <ThemedView style={{ flexDirection: "row", gap: 10 }}>
          {/* Gender */}
          {user.gender && (
            <ThemedView
              style={[
                styles.genderZodiacContainer,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#4985b2" : "#b3d8f5",
                },
              ]}
            >
              {user?.gender && (
                <Ionicons
                  name={
                    user.gender === "male"
                      ? "male-outline"
                      : user.gender === "female"
                      ? "female-outline"
                      : "transgender-outline"
                  }
                  size={16}
                  color={color.primaryIcon}
                />
              )}

              <ThemedText>{age}</ThemedText>
            </ThemedView>
          )}

          {/* Zodiac */}
          {zodiacKey && (
            <ThemedView
              style={[
                styles.genderZodiacContainer,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#ed1a92" : "#f7c6e2",
                },
              ]}
            >
              <ThemedText style={styles.zodiacSymbol}>
                {ZODIAC_UNICODE[zodiacKey]}
              </ThemedText>
              <ThemedText style={styles.zodiacLabel}>{zodiacKey}</ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    alignItems: "center",
  },
  imageContainer: {
    alignItems: "center",
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: "hidden",
    padding: 2,
    borderWidth: 2,
  },
  coverImage: {
    width: "100%",
    height: "100%",
    borderRadius: 45,
  },
  genderZodiacContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  zodiacSymbol: {
    fontSize: 16,
  },
  zodiacLabel: {
    textTransform: "capitalize",
  },
});
