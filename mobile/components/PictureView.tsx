// import React from "react";
// import { ThemedView } from "./ThemedView";
// import { Image } from "expo-image";
// import {
//   Alert,
//   StyleSheet,
//   TouchableOpacity,
//   useColorScheme,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import { Colors } from "react-native/Libraries/NewAppScreen";
// import { saveToLibraryAsync } from "expo-media-library";

// export default function PictureView({
//   picture,
//   setPicture,
// }: {
//   picture: string;
//   setPicture: (picture: string | null) => void;
// }) {
//   const router = useRouter();
//   const colorScheme = useColorScheme();
//   const color = Colors[colorScheme ?? "light"];
//   if (!picture) return null;

//   return (
//     <ThemedView style={styles.container}>
//       <ThemedView style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()}>
//           <Ionicons name="chevron-back-outline" size={22} color={color.primaryIcon} />
//         </TouchableOpacity>
//         <TouchableOpacity
//           onPress={async () => {
//             await saveToLibraryAsync(picture);
//             Alert.alert("Image saved to gallery.");
//           }}
//         >
//           <Ionicons name="download-outline" size={22} color={color.primaryIcon} />
//         </TouchableOpacity>
//       </ThemedView>

//       <Image source={picture} style={{ width: "100%", height: "100%" }} />
//     </ThemedView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   header: {
//     paddingVertical: 8,
//     paddingHorizontal: 15,
//     // paddingRight: 20,
//     flexDirection: "row",
//     alignItems: "center",
//     borderBottomWidth: 0.4,
//   },
// });
