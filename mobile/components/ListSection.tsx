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
  onItemPress?: (item: ListItem) => void;
}

export const ListSection: React.FC<Props> = ({ title, data, onItemPress }) => {
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];
  const handleItemPress = (item: ListItem) => {
    if (onItemPress) {
      onItemPress(item);
    }
  };

  const renderItem = ({ item }: { item: ListItem }) => {
    const isDelete = item.label.toLowerCase() === "delete";

    return (
      <TouchableOpacity onPress={() => handleItemPress(item)}>
        <ThemedView style={styles.listItem}>
          <Ionicons
            name={item.iconName}
            size={24}
            color={isDelete ? "red" : color.icon}
          />
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
});
