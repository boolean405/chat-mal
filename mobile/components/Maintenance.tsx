import React from "react";
import { StyleSheet, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { ThemedButton } from "./ThemedButton";

export default function Maintenance({ title = "This page" }) {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <Image
        source={require("../assets/images/maintenance.png")}
        style={styles.image}
      />
      <ThemedText type="title">Coming Soon</ThemedText>
      <ThemedText type="subtitle" style={styles.subtitle}>
        {`${title} is not available yet. Stay tuned!`}
      </ThemedText>

      <ThemedButton
        title="Go Back"
        onPress={() => router.back()}
        style={styles.button}
        isLoading={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 32,
    resizeMode: "contain",
  },
  subtitle: {
    marginVertical: 10,
  },
  button: {
    width: "100%",
    marginTop: 50,
  },
});
