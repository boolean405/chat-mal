import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  ToastAndroid,
} from "react-native";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { Ionicons } from "@expo/vector-icons";
import { ThemedView } from "./ThemedView";

type ImagePreviewProps = {
  photoUri: string;
  onSend: () => void;
  onClose: () => void;
  isFrontCamera: boolean;
};

export default function ImagePreview({
  photoUri,
  onSend,
  onClose,
  isFrontCamera,
}: ImagePreviewProps) {
  const [saving, setSaving] = useState(false);

  const saveToGallery = async () => {
    try {
      setSaving(true);
      const asset = await MediaLibrary.createAssetAsync(photoUri);
      await MediaLibrary.createAlbumAsync("MyAppPhotos", asset, false);
      ToastAndroid.show("Saved to gallery!", ToastAndroid.SHORT);
    } catch (error: any) {
      ToastAndroid.show("Failed to save image", ToastAndroid.SHORT);
    } finally {
      setSaving(false);
    }
  };

  const shareImage = async () => {
    try {
      await Sharing.shareAsync(photoUri);
    } catch (error: any) {
      ToastAndroid.show("Failed to share image", ToastAndroid.SHORT);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Image
        source={{ uri: photoUri }}
        style={[styles.image, isFrontCamera && { transform: [{ scaleX: -1 }] }]}
        resizeMode="cover"
      />

      {/* Close Button Top-Right */}
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Ionicons name="close" size={22} color="#fff" />
      </TouchableOpacity>

      {/* Bottom Action Bar */}
      <ThemedView style={styles.bottomBar}>
        <TouchableOpacity onPress={saveToGallery} disabled={saving}>
          <Ionicons name="download-outline" size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={shareImage}>
          <Ionicons name="share-social-outline" size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={onSend}>
          <Ionicons name="send" size={22} color="rgba(35, 175, 175, 0.89)" />
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  image: {
    flex: 1,
    width: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 20,
  },
  bottomBar: {
    position: "absolute",
    bottom: 10,
    width: "90%",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "center",
  },
  bottomAction: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
});
