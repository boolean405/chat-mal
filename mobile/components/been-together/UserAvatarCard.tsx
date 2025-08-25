import React from "react";
import { StyleSheet, useColorScheme } from "react-native";
import { Image } from "expo-image";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";

const ZODIAC_UNICODE: Record<string, string> = {
  aries: "♈︎",
  taurus: "♉︎",
  gemini: "♊︎",
  cancer: "♋︎",
  leo: "♌︎",
  virgo: "♍︎",
  libra: "♎︎",
  scorpio: "♏︎",
  sagittarius: "♐︎",
  capricorn: "♑︎",
  aquarius: "♒︎",
  pisces: "♓︎",
};
type ZodiacKey = keyof typeof ZODIAC_UNICODE;

type Props = {
  name: string;
  age: number;
  gender: "male" | "female";
  zodiac: ZodiacKey;
  imageUri: string;
};

export default function UserAvatarCard({
  name,
  age,
  gender,
  zodiac,
  imageUri,
}: Props) {
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];

  return (
    <ThemedView style={styles.avatarContainer}>
      {/* Avatar image */}
      <ThemedView style={styles.imageContainer}>
        <Image
          source={{ uri: imageUri }}
          contentFit="contain"
          style={styles.coverImage}
        />
      </ThemedView>

      {/* Name */}
      <ThemedText type="large" style={{ marginVertical: 10 }}>
        {name}
      </ThemedText>

      {/* Gender + Zodiac row */}
      <ThemedView style={{ flexDirection: "row", gap: 10 }}>
        {/* Gender */}
        <ThemedView
          style={[
            styles.genderZodiacContainer,
            { backgroundColor: colorScheme === "dark" ? "#4985b2" : "#b3d8f5" },
          ]}
        >
          <Ionicons
            name={gender === "male" ? "male-outline" : "female-outline"}
            size={16}
            color={color.primaryIcon}
          />
          <ThemedText>{age}</ThemedText>
        </ThemedView>

        {/* Zodiac */}
        <ThemedView
          style={[
            styles.genderZodiacContainer,
            { backgroundColor: colorScheme === "dark" ? "#ed1a92" : "#f7c6e2" },
          ]}
        >
          <ThemedText style={styles.zodiacSymbol}>
            {ZODIAC_UNICODE[zodiac]}
          </ThemedText>
          <ThemedText style={styles.zodiacLabel}>{zodiac}</ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    alignItems: "center",
  },
  imageContainer: {
    backgroundColor: "gray",
    alignItems: "center",
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: "hidden",
    padding: 1,
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
