import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  Text,
} from "react-native";
import { useState } from "react";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { APP_NAME } from "@/constants";

export default function ImageViewer() {
  const { imageUrl } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    let permission = await MediaLibrary.getPermissionsAsync();

    if (!permission.granted) {
      const request = await MediaLibrary.requestPermissionsAsync();
      permission = request;
    }

    if (!permission.granted) {
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

      const asset = await MediaLibrary.createAssetAsync(download.uri);
      const album = await MediaLibrary.getAlbumAsync(APP_NAME);
      if (album == null) {
        await MediaLibrary.createAlbumAsync(APP_NAME, asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album.id, false);
      }

      Alert.alert("Success", "Image saved to gallery!");
    } catch (error) {
      Alert.alert("Error", "Failed to save the image.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    router.back();
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

        {/* Close button */}
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>

        {/* Save button at bottom */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.bottomAction}
            onPress={handleDownload}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="download-outline" size={26} color="#fff" />
                <Text style={styles.actionText}>Save</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
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
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 25,
    zIndex: 10,
  },
  bottomBar: {
    position: "absolute",
    bottom: 30,
    width: "60%",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
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
    paddingHorizontal: 10,
  },
  actionText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 5,
  },
});
