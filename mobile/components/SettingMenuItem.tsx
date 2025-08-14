import React, { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  LayoutAnimation,
  Platform,
  UIManager,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { SettingMenuItem as ParentItem, SettingMenuChildItem } from "@/types";

// Enable Android LayoutAnimation only on the old architecture
const isFabric = !!(global as any).nativeFabricUIManager;

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental &&
  !isFabric
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  item: ParentItem;
  disabled?: boolean;
  forceExpand?: boolean;
};

export default function SettingCard({
  item,
  disabled = false,
  forceExpand,
}: Props) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];

  const hasChildren = !!item.children?.length;
  const [expanded, setExpanded] = useState<boolean>(!!forceExpand);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!!forceExpand);
  }, [forceExpand]);

  const toggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((s) => !s);
  }, []);

  return (
    <ThemedView
      style={[
        styles.card,
        {
          backgroundColor: color.secondaryBackground,
        },
      ]}
    >
      {/* Header row (main item) */}
      <TouchableOpacity
        onPress={hasChildren ? toggle : undefined}
        activeOpacity={0.7}
      >
        <View style={styles.headerRow}>
          <Ionicons name={item.iconName} size={24} color={color.primaryIcon} />
          <View style={styles.headerTexts}>
            <ThemedText type="large" numberOfLines={1}>
              {item.title}
            </ThemedText>
            {!!item.desc && (
              <ThemedText numberOfLines={1} style={{ color: "gray" }}>
                {item.desc}
              </ThemedText>
            )}
          </View>

          {hasChildren && (
            <Ionicons
              name={expanded ? "chevron-up-outline" : "chevron-down-outline"}
              size={22}
              color={color.primaryIcon}
            />
          )}
        </View>
      </TouchableOpacity>

      {/* Children inside the SAME card */}
      {expanded && hasChildren && (
        <View style={styles.childrenBlock}>
          {/* top divider */}
          <View
            style={[styles.divider, { backgroundColor: color.primaryBorder }]}
          />

          {/* Add index if need divider */}
          {item.children!.map((child: SettingMenuChildItem) => (
            <TouchableOpacity
              key={child.id}
              onPress={() =>
                router.push({
                  pathname: `/(setting)/${child.path}`,
                } as any)
              }
              disabled={disabled}
              activeOpacity={0.7}
            >
              <View style={styles.childRow}>
                <Ionicons
                  name={child.iconName}
                  size={20}
                  color={color.primaryIcon}
                  style={{ marginRight: 12 }}
                />
                <ThemedText numberOfLines={1} style={{ flex: 1 }}>
                  {child.title}
                </ThemedText>
                <Ionicons
                  name="chevron-forward-outline"
                  size={18}
                  color={color.primaryIcon}
                />
              </View>
              {/* divider between child rows */}
              {/* {childrenIndex !== item.children!.length - 1 && (
                <View
                  style={[
                    styles.divider,
                    // { backgroundColor: color.primaryBorder },
                  ]}
                />
              )} */}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    marginVertical: 6,
    overflow: "hidden", // keeps child dividers/rows neatly clipped
  },
  headerRow: {
    minHeight: 56,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTexts: {
    flex: 1,
    marginRight: 8,
  },
  childrenBlock: {
    paddingVertical: 4,
  },
  childRow: {
    minHeight: 44,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  divider: {
    height: 0.4,
    marginHorizontal: 15,
    // marginLeft: 15 + 24 + 12, // align under child icon area
  },
});
