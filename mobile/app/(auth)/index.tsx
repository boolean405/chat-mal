import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";

import { ThemedView } from "@/components/ThemedView";
import { useAuthStore } from "@/stores/authStore";

// const { width } = Dimensions.get("window");

export default function FlashScreen() {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    // Pulsing animation on logo
    const loadingFlash = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );

    loadingFlash.start();

    const timeout = setTimeout(() => {
      if (checkAuth()) router.replace("/(tab)");
      else router.replace("/(auth)/login-or-register");
    }, 1500);

    return () => {
      loadingFlash.stop();
      clearTimeout(timeout);
    };
  }, [scaleAnim, checkAuth, router]);

  return (
    <ThemedView style={styles.container}>
      {/* Animated logo + header */}
      <Animated.View
        style={[styles.topIllustration, { transform: [{ scale: scaleAnim }] }]}
      >
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.illustrationImage}
          contentFit="contain"
        />
        {/* <ThemedView style={styles.header}> */}
        {/* <ThemedText type="title" style={styles.title}>
            {APP_NAME}
          </ThemedText> */}
        {/* <ThemedText type="subtitle">{APP_TAGLINE}</ThemedText> */}
        {/* </ThemedView> */}
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  topIllustration: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  illustrationImage: {
    width: 150,
    height: 150,
    // height: width * 0.4,
  },
  header: {
    alignItems: "center",
  },
  title: {
    marginBottom: 10,
  },
});
