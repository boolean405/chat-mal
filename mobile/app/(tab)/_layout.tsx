import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, StyleSheet, Text, View } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { Colors } from "@/constants/colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useChatStore } from "@/stores/chatStore";
import { ThemedText } from "@/components/ThemedText";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  // Get current color scheme (light or dark)
  const colorScheme = useColorScheme();
  const unreadCount = useChatStore((state) => state.totalUnreadCount);
  const insets = useSafeAreaInsets();

  const tabBarLabel = (label: string) => {
    const Component = ({
      focused,
      color,
    }: {
      focused: boolean;
      color: string;
    }) =>
      focused ? <Text style={{ color, fontSize: 12 }}>{label}</Text> : null;

    Component.displayName = `TabLabel_${label}`;
    return Component;
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Hide the default header
        tabBarButton: HapticTab, // Custom tab button with haptics
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].text, // Use theme color for active tab
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute", // Absolute positioning for iOS
            backgroundColor: Colors[colorScheme ?? "light"].background,
          },
          default: {
            backgroundColor: Colors[colorScheme ?? "light"].background,
            // paddingBottom: insets.bottom, // Add bottom safe area
            // height: 50 + insets.bottom, // Optional: adjust height to avoid layout squeeze
          },
        }),
      }}
    >
      {/* Chat tab with badge */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="chatbubble-outline" size={size} color={color} />
              {unreadCount > 0 && (
                <View style={styles.badgeContainer}>
                  <ThemedText style={styles.badgeText} type="smaller">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </ThemedText>
                </View>
              )}
            </View>
          ),
          tabBarLabel: tabBarLabel("Chat"),
        }}
      />

      {/* Discover tab */}
      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="play-outline" size={size} color={color} />
          ),
          tabBarLabel: tabBarLabel("Discover"),
        }}
      />

      {/* Wallet tab */}
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size} color={color} />
          ),
          tabBarLabel: tabBarLabel("Wallet"),
        }}
      />

      {/* Notification tab */}
      <Tabs.Screen
        name="notification"
        options={{
          title: "Notification",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
          tabBarLabel: tabBarLabel("Notification"),
        }}
      />

      {/* Menu tab */}
      <Tabs.Screen
        name="menu"
        options={{
          title: "Menu",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="menu-outline" size={size} color={color} />
          ),
          tabBarLabel: tabBarLabel("Menu"),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badgeContainer: {
    position: "absolute",
    top: -4,
    right: -10,
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 5,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontWeight: "bold",
    color: "white",
  },
});
