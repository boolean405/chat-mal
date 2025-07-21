import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Alert, Platform, Linking } from "react-native";
import videoCompressor from "./videoCompressor";

export async function pickMedia() {
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
      quality: 0.5,
      base64: true,
      allowsMultipleSelection: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      const mediaDataArray = await Promise.all(
        result.assets.map(async (asset) => {
          const { uri: originalUri, fileName = "media", type, base64 } = asset;
          
          // Compress video
          const uri = await videoCompressor(originalUri);

          const base64Data =
            base64 ??
            (await FileSystem.readAsStringAsync(uri, {
              encoding: FileSystem.EncodingType.Base64,
            }));

          return { uri, fileName, type, base64: base64Data };
        })
      );

      return mediaDataArray;
    }

    return null;
  } catch (error) {
    console.error("Media picker error:", error);
    return null;
  }
}
