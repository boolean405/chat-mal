import { ListSection } from "@/components/ListSection";
import { LogoutButton } from "@/components/LogoutButton";
import { ProfileHeader } from "@/components/ProfileHeader";
import { ThemedView } from "@/components/ThemedView";
import { WalletTab } from "@/components/WalletTab";
import { Colors } from "@/constants/colors";
import { MENUS, SETTINGS } from "@/constants/data";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { MenuItem, SettingItem } from "@/types";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  ToastAndroid,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const screenWidth = Dimensions.get("window").width;
const CONTAINER_WIDTH = screenWidth * 0.8;

export default function Menu() {
  const colorScheme = useColorScheme();
  const color = colorScheme === "dark" ? Colors.dark : Colors.light;
  const router = useRouter();
  const isNavigatingRef = useRef(false);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuthStore();
  const { requestUnreadCount } = useChatStore();

  const walletBalance = 0.0;
  const isOnline = true;

  const handleUsernameCopied = (username: string) => {
    ToastAndroid.show("Username copied!", ToastAndroid.SHORT);
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    // need to call api
    setIsRefreshing(false);
    ToastAndroid.show("Refreshed", ToastAndroid.SHORT);
  };
  if (!user) return null;

  const handleItemPress = (item: MenuItem) => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setIsLoading(true);

    try {
      if (item.path) {
        router.push(`/(menu)${item.path}` as any);
      }
    } catch (error: any) {
      ToastAndroid.show(error.message, ToastAndroid.SHORT);
    } finally {
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 1000); // consistent delay for all cases
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[{ flex: 1, backgroundColor: color.background }]}
      edges={["top"]}
    >
      <ScrollView
        style={[styles.outerContainer, { backgroundColor: color.background }]}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={color.tint}
            colors={[color.background]}
            progressBackgroundColor={color.tint}
          />
        }
      >
        <ThemedView style={styles.container}>
          <ProfileHeader
            name={user?.name}
            username={user?.username}
            isOnline={isOnline}
            tint={color.tint}
            textColor={color.text}
            iconColor={color.icon}
            secondary={color.secondary}
            onUsernameCopied={handleUsernameCopied}
            profilePhoto={user?.profilePhoto}
            onPress={() => router.push("/(setting)/edit-profile")}
          />

          <WalletTab
            balance={walletBalance}
            tint={color.tint}
            backgroundColor={color.secondary}
          />

          <ListSection
            title="Menus"
            data={MENUS}
            disabled={isLoading}
            notificationCount={{
              // add more next time
              "/message-request": requestUnreadCount,
            }}
            onItemPress={(item) => {
              handleItemPress(item);
            }}
          />

          <ListSection
            title="Settings"
            data={SETTINGS}
            disabled={isLoading}
            onItemPress={(item) => {
              console.log(item.label);
            }}
          />

          <LogoutButton />
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  container: {
    width: CONTAINER_WIDTH,
    alignSelf: "center",
    paddingTop: 40,
  },
});
