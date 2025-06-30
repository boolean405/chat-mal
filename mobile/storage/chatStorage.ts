import { Chat } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Save an array of Chat objects
export async function saveChatsData(chats: Chat[]) {
  return await AsyncStorage.setItem("chats", JSON.stringify(chats));
}

// Retrieve the array of Chat objects
export async function getChatsData(): Promise<Chat[] | null> {
  const chats = await AsyncStorage.getItem("chats");
  return chats ? JSON.parse(chats) : null;
}

// Clear saved chats
export async function clearChatData() {
  await AsyncStorage.removeItem("chats");
}
