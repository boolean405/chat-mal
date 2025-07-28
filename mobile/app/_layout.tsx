import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

import { useEffect } from "react";
import "react-native-reanimated";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useColorScheme } from "@/hooks/useColorScheme";
import SafeScreen from "@/components/SafeScreen";
import { FloatingCall } from "@/components/FloatingCall";
import { useNotifications } from "@/hooks/useNotifications";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useNotifications();
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Hide splash screen when fonts are loaded
  useEffect(() => {
    const prepare = async () => {
      if (fontsLoaded) {
        await SplashScreen.hideAsync();
      }
    };
    prepare();
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <KeyboardProvider>
          <SafeAreaProvider style={{ flex: 1 }}>
            <SafeScreen>
              <Stack>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tab)" options={{ headerShown: false }} />
                <Stack.Screen name="(chat)" options={{ headerShown: false }} />
                <Stack.Screen name="(menu)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="(setting)"
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="+not-found" />
              </Stack>
            </SafeScreen>
            <FloatingCall />
            <StatusBar style="auto" />
          </SafeAreaProvider>
        </KeyboardProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
