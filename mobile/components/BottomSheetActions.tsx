import React from "react";
import {
  Modal,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  useColorScheme,
  Dimensions,
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetOption } from "@/types";
import { Colors } from "@/constants/colors";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MAX_SHEET_HEIGHT = SCREEN_HEIGHT * 0.5;

interface Props {
  visible: boolean;
  title?: string;
  options: BottomSheetOption[];
  onSelect: (index: number) => void;
  onCancel: () => void;
}

export default function BottomSheetAction({
  visible,
  title,
  options,
  onSelect,
  onCancel,
}: Props) {
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={onCancel}>
        <ThemedView style={styles.overlay}>
          <ThemedView
            style={[
              styles.sheet,
              {
                backgroundColor: color.secondaryBackground,
                maxHeight: MAX_SHEET_HEIGHT,
              },
            ]}
          >
            {/* Add the handle here */}
            <ThemedView
              style={[styles.handle, { backgroundColor: color.primaryText }]}
            />

            {title && (
              <ThemedText
                type="larger"
                numberOfLines={1}
                style={[
                  styles.title,
                  {
                    borderBottomColor: color.secondaryBorder,
                  },
                ]}
              >
                {title}
              </ThemedText>
            )}
            {options.map(({ name, icon }, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => onSelect(index)}
                style={styles.optionButton}
              >
                <Ionicons
                  name={icon as keyof typeof Ionicons.glyphMap}
                  size={24}
                  color={color.primaryIcon}
                />
                <ThemedText
                  style={[
                    name === "Delete" && { color: "red" },
                    styles.nameText,
                  ]}
                >
                  {name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    paddingTop: 10,
    paddingHorizontal: 30,
  },
  title: {
    // textAlign: "center",
    // padding: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.3,
    marginBottom: 5,
    // borderColor: "#eee",
  },
  optionButton: {
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  nameText: {
    paddingLeft: 15,
  },
  handle: {
    width: 40,
    height: 3,
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 10,
    marginTop: 5,
  },
});

// {/* Custom Sheet */}
// <BottomSheetAction
//   color={color}
//   visible={isSheetVisible}
//   title={selectedChat?.name}
//   options={bottomSheetOptions.flatMap(({ _id, name, icon }) => {
//     if (_id === "3") {
//       return selectedChat?.isGroupChat === false
//         ? [{ _id, name: `${name} ${selectedChat.name}`, icon }]
//         : [];
//     }
//     if (_id === "4") {
//       return selectedChat?.isGroupChat ? [{ _id, name, icon }] : [];
//     }
//     return [{ _id, name, icon }];
//   })}
//   onSelect={handleOptionSelect}
//   onCancel={() => setSheetVisible(false)}
// />
