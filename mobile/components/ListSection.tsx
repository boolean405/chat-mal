import React from "react";
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/colors";

interface ListItem {
  id: string;
  label: string;
  path: string;
  iconName: keyof typeof Ionicons.glyphMap;
  onItemPress?: () => void;
}

interface Props {
  title: string;
  data: ListItem[];
  disabled: boolean;
  notificationCount?: Record<string, number>;
  onItemPress?: (item: ListItem) => void;
}

export const ListSection: React.FC<Props> = ({
  title,
  data,
  disabled,
  notificationCount,
  onItemPress,
}) => {
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];
  const handleItemPress = (item: ListItem) => {
    if (onItemPress) {
      onItemPress(item);
    }
  };

  const renderItem = ({ item }: { item: ListItem }) => {
    const isDelete = item.label.toLowerCase() === "delete";
    const count = notificationCount?.[item.path] ?? 0;

    return (
      <TouchableOpacity
        onPress={() => handleItemPress(item)}
        disabled={disabled}
      >
        <ThemedView style={styles.listItem}>
          <ThemedView style={styles.iconContainer}>
            <Ionicons
              name={item.iconName}
              size={24}
              color={isDelete ? "red" : color.icon}
            />
            {count > 0 && (
              <ThemedView style={styles.badgeContainer}>
                <ThemedText type="smaller" style={styles.badgeText}>
                  {count > 9 ? "9+" : count}
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>

          <ThemedText
            style={[
              styles.listLabel,
              isDelete && { color: "red", fontWeight: "700" },
            ]}
          >
            {item.label}
          </ThemedText>
        </ThemedView>
      </TouchableOpacity>
    );
  };
  return (
    <>
      <ThemedText style={[styles.sectionTitle]}>{title}</ThemedText>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        scrollEnabled={false}
        style={styles.list}
        showsVerticalScrollIndicator={false}

        // ItemSeparatorComponent={() => (
        //   <ThemedView
        //     style={[styles.separator, { backgroundColor: color.secondary }]}
        //   />
        // )}
      />
    </>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  list: {
    marginBottom: 25,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  listLabel: {
    marginLeft: 16,
    fontSize: 16,
  },
  separator: {
    height: 1,
    marginLeft: 40,
  },
  iconContainer: {
    position: "relative",
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeContainer: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "red",
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 2,
  },
  badgeText: {
    color: "white",
    fontWeight: "bold",
  },
});
