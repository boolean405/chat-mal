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
    <ScrollView
      style={[
        styles.outerContainer,
        { backgroundColor: color.primaryBackground },
      ]}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={color.tint}
          colors={[color.primaryText]}
          progressBackgroundColor={color.secondaryBackground}
          title="Refreshing..." // Optional (iOS)
          titleColor={color.primaryText} // Optional (iOS)
        />
      }
    >
      <ThemedView style={styles.container}>
        <ProfileHeader
          name={user?.name}
          isOnline={isOnline}
          username={user?.username}
          profilePhoto={user?.profilePhoto}
          onUsernameCopied={handleUsernameCopied}
          onPress={() => router.push("/(setting)/edit-profile")}
        />
        {/* 
        <WalletTab
          balance={walletBalance}
          tint={color.tint}
          backgroundColor={color.secondaryText}
        /> */}

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
            router.push(`/(menu)${item.path}` as any);
          }}
        />

        <LogoutButton />
      </ThemedView>
    </ScrollView>
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
