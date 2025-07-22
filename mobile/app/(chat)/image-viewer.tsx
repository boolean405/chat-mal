import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useState } from "react";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { useLocalSearchParams } from "expo-router";
import * as MediaLibrary from "expo-media-library";
import { StatusBar } from "expo-status-bar";

export default function ImageViewer() {
  const { imageUrl } = useLocalSearchParams();

  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    let permission = await MediaLibrary.getPermissionsAsync();

    if (!permission.granted) {
      // Try to request permission again
      const request = await MediaLibrary.requestPermissionsAsync();
      permission = request;
    }

    if (!permission.granted) {
      // If still denied, show alert with option to go to settings
      Alert.alert(
        "Permission Required",
        "To save images, please allow media access in your settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }

    try {
      setLoading(true);
      const fileUri = FileSystem.documentDirectory + "image.jpg";
      const download = await FileSystem.downloadAsync(
        imageUrl as string,
        fileUri
      );
      await MediaLibrary.saveToLibraryAsync(download.uri);
      Alert.alert("Success", "Image saved to gallery!");
    } catch (error) {
      console.error("Download failed:", error);
      Alert.alert("Error", "Failed to save the image.");
    } finally {
      setLoading(false);
    }
  };

  if (!imageUrl || typeof imageUrl !== "string") return null;

  return (
    <>
      <StatusBar hidden />
      <View style={styles.container}>
        <Image
          source={{ uri: imageUrl }}
          contentFit="contain"
          style={styles.image}
          cachePolicy="memory-disk"
        />

        {/* Download button */}
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={handleDownload}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Ionicons name="download-outline" size={28} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width,
    height,
  },
  downloadButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
    borderRadius: 25,
  },
});
