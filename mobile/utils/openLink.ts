import { Alert, Linking } from "react-native";

export default async function openLink(url: string) {
  try {
    const can = await Linking.canOpenURL(url);
    if (!can) {
      Alert.alert("Unavailable", "This link can't be opened on your device.");
      return;
    }
    await Linking.openURL(url);
  } catch (e) {
    Alert.alert("Error", "Failed to open the link. Try again.");
  }
}
