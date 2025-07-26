import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Alert, Platform } from "react-native";
import { imageCompressor } from "./mediaCompressor";

export default async function pickImage(
  setImage: React.Dispatch<React.SetStateAction<string | null>>,
  setImageBase64: React.Dispatch<React.SetStateAction<string | null>>,
  setIsError?: React.Dispatch<React.SetStateAction<boolean>>,
  setErrorMessage?: React.Dispatch<React.SetStateAction<string>>,
  aspect?: [number, number],
  onUpload?: (uri: string, base64: string) => Promise<void>
) {
  try {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permission Required", "Please allow media access!");
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect,
    });

    // if (result.canceled) return false;
    if (!result.canceled && result.assets?.length) {
      const originalUri = result.assets[0].uri;

      const uri = await imageCompressor(originalUri);
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      setImage(uri);
      setImageBase64(base64);
      if (onUpload) await onUpload(uri, base64);
      // return true;
    }
  } catch (error: any) {
    const message = error?.message || "Image picker error";
    setIsError?.(true);
    setErrorMessage?.(message);
    Alert.alert("Image Picker Error", message);
  }
}
