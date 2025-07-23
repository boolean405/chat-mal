import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  ToastAndroid,
  Dimensions,
  Alert,
  Linking, // Import Dimensions for responsive image sizing
} from "react-native";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { Ionicons } from "@expo/vector-icons";
import { ThemedView } from "./ThemedView"; // Assuming ThemedView is available
import { ThemedText } from "./ThemedText";
import { APP_NAME } from "@/constants";

type ImagePreviewProps = {
  photoUri: string;
  onSend: () => void;
  onClose: () => void;
  isFrontCamera: boolean; // Prop to indicate if the photo was taken with the front camera
};

export default function ImagePreview({
  photoUri,
  onSend,
  onClose,
  isFrontCamera,
}: ImagePreviewProps) {
  const [saving, setSaving] = useState(false);
  const { width, height } = Dimensions.get("window"); // Get screen dimensions

  // Function to save the image to the device's gallery
  const saveToGallery = async () => {
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
      setSaving(true);
      const asset = await MediaLibrary.createAssetAsync(photoUri); // Create an asset from the URI
      // Attempt to create an album or add to an existing one
      const album = await MediaLibrary.getAlbumAsync(APP_NAME);
      if (album == null) {
        await MediaLibrary.createAlbumAsync(APP_NAME, asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album.id, false);
      }
      ToastAndroid.show("Saved to gallery!", ToastAndroid.SHORT);
    } catch (error: any) {
      console.error("Failed to save image:", error);
      ToastAndroid.show("Failed to save image", ToastAndroid.SHORT);
    } finally {
      setSaving(false);
    }
  };

  // Function to share the image using the device's sharing capabilities
  const shareImage = async () => {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(photoUri);
      } else {
        ToastAndroid.show(
          "Sharing is not available on this device",
          ToastAndroid.SHORT
        );
      }
    } catch (error: any) {
      console.error("Failed to share image:", error);
      ToastAndroid.show("Failed to share image", ToastAndroid.SHORT);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Image
        source={{ uri: photoUri }}
        style={[
          styles.image,
          { width: width, height: height }, // Make image fill the screen
          isFrontCamera && { transform: [{ scaleX: -1 }] }, // Flip horizontally for front camera photos
        ]}
        resizeMode="contain" // Use 'contain' to ensure the whole image is visible
      />

      {/* Close Button Top-Right */}
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Ionicons name="close" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Bottom Action Bar */}
      <ThemedView style={styles.bottomBar}>
        {/* Save Button */}
        <TouchableOpacity
          onPress={saveToGallery}
          disabled={saving}
          style={styles.bottomAction}
        >
          <Ionicons name="download-outline" size={26} color="#fff" />
          <ThemedText style={styles.actionText}>Save</ThemedText>
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity onPress={shareImage} style={styles.bottomAction}>
          <Ionicons name="share-social-outline" size={26} color="#fff" />
          <ThemedText style={styles.actionText}>Share</ThemedText>
        </TouchableOpacity>

        {/* Send Button */}
        <TouchableOpacity onPress={onSend} style={styles.bottomAction}>
          <Ionicons name="send" size={26} color="rgba(35, 175, 175, 0.89)" />
          <ThemedText style={styles.actionText}>Send</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    backgroundColor: "black", // Background for the preview
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    // Flex 1 and width/height 100% will make it fill the parent container
    // Actual dimensions set dynamically based on screen size
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 25,
  },
  bottomBar: {
    position: "absolute",
    bottom: 30,
    width: "90%",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "rgba(0,0,0,0.6)", // Slightly darker for better contrast
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "space-around", // Distribute items evenly
    alignItems: "center",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  bottomAction: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10, // Add some padding for touchability
  },
  actionText: {
    color: "white",
    fontSize: 12,
    marginTop: 5,
  },
});
