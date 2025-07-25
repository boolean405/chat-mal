import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Alert, Platform, Linking } from "react-native";
import { imageCompressor, videoCompressor } from "./mediaCompressor";

export async function chatMediaPicker() {
  try {
    if (Platform.OS !== "web") {
      let { status, canAskAgain } =
        await ImagePicker.getMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        if (canAskAgain) {
          const result =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          status = result.status;
        }

        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please enable media library access in settings.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Open Settings", onPress: () => Linking.openSettings() },
            ]
          );
          return null;
        }
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
    });

    if (!result.canceled && result.assets?.length) {
      const asset = result.assets[0];
      const type = asset.type;

      if (type === "video" && asset.duration && asset.duration > 60 * 1000) {
        Alert.alert(
          "Video is longer than 1 minute. Please select a shorter one."
        );
        return;
      }

      const uri =
        type === "image"
          ? await imageCompressor(asset.uri)
          : type === "video"
          ? await videoCompressor(asset.uri)
          : asset.uri;

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return {
        uri,
        base64,
        type,
      };
    }

    return null;
  } catch (error) {
    console.log("Media picker error:", error);
    return null;
  }
}
