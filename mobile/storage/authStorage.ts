// import { User } from "@/types";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// export async function saveUserData(user: User, accessToken: string) {
//   await AsyncStorage.setItem("user", JSON.stringify(user));
//   if (accessToken) await AsyncStorage.setItem("accessToken", accessToken);
// }

// export async function getUserData() {
//   const user = await AsyncStorage.getItem("user");
//   return user ? JSON.parse(user) : null;
// }

// export async function getAccessToken() {
//   return await AsyncStorage.getItem("accessToken");
// }

// export async function clearUserData() {
//   await AsyncStorage.removeItem("user");
//   await AsyncStorage.removeItem("accessToken");
// }
