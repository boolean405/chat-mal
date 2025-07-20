// app/(chat)/ImageViewer.tsx

import { Image } from "expo-image";
import { StyleSheet, View, Dimensions } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function ImageViewer() {
  const { imageUrl } = useLocalSearchParams();

  if (!imageUrl || typeof imageUrl !== "string") return null;

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: imageUrl }}
        contentFit="contain" // or "cover" if you want it to crop and fill screen
        style={styles.image}
      />
    </View>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  image: {
    width,
    height,
  },
});
