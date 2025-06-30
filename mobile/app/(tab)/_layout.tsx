import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/HapticTab";
import { Colors } from "@/constants/colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  // Get current color scheme (light or dark)
  const colorScheme = useColorScheme();

  // Get safe area insets for padding (e.g., bottom space on iPhone X)
  const insets = useSafeAreaInsets();

  // Custom label function that only shows label when tab is focused
  const tabBarLabel =
    (label: string) =>
    ({ focused, color }: any) =>
      focused ? <Text style={{ color }}>{label}</Text> : null;

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
            paddingTop: 10,
            paddingBottom: insets.bottom,
            height: 60 + insets.bottom, // Adjust height for Android and safe area
            backgroundColor: Colors[colorScheme ?? "light"].background,
          },
        }),
      }}
    >
      {/* Chat tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-outline" size={size} color={color} />
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
