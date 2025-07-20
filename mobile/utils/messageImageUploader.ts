import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Alert, Platform } from "react-native";

export async function pickImage() {
  try {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permission Required", "Please allow media access!");
        return null;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "livePhotos"],
      quality: 0.5,
      base64: true,
      allowsMultipleSelection: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      const imageDataPromises = result.assets.map(async (asset) => {
        const uri = asset.uri;
        const fileName = asset.fileName || "image.jpg";
        const type = asset.type || "image";
        let base64: string;

        if (asset.base64) {
          base64 = asset.base64;
        } else {
          base64 = await FileSystem.readAsStringAsync(asset.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
        }

        return { base64, uri, fileName, type };
      });

      const imageDataArray = await Promise.all(imageDataPromises);
      return imageDataArray;
    }

    return null;
  } catch (error) {
    console.error("Image picker error:", error);
    return null;
  }
}
