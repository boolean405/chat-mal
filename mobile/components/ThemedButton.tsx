import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
} from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";

export type ThemedButtonProps = TouchableOpacityProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "primary" | "secondary" | "link";
  title: any;
  isLoading: boolean;
};

export function ThemedButton({
  style,
  lightColor,
  darkColor,
  type = "primary",
  title,
  isLoading,
  ...rest
}: ThemedButtonProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "primaryText"
  );
  const textColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "primaryBackground"
  );

  return (
    <TouchableOpacity
      style={[
        styles.base,
        type === "primary" && { backgroundColor },
        type === "secondary" && styles.secondary,
        type === "link" && styles.linkButton,
        style,
      ]}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 16,
    fontWeight: "semibold",
  },
  secondary: {
    backgroundColor: "#ccc",
  },
  linkButton: {
    backgroundColor: "transparent",
    paddingVertical: 6,
  },
  linkText: {
    color: "#0a7ea4",
    fontSize: 16,
  },
});
