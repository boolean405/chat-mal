import { StyleSheet, Text, type TextProps } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?:
    | "default"
    | "title"
    | "defaultItalic"
    | "defaultBold"
    | "subtitle"
    | "link"
    | "linkItalic"
    | "small"
    | "smallItalic"
    | "extraSmallBold";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    <Text
      style={[
        { color },
        type === "default" ? styles.default : undefined,
        type === "defaultItalic" ? styles.defaultItalic : undefined,
        type === "defaultBold" ? styles.defaultBold : undefined,
        type === "title" ? styles.title : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "small" ? styles.small : undefined,
        type === "smallItalic" ? styles.smallItalic : undefined,
        type === "extraSmallBold" ? styles.extraSmallBold : undefined,
        type === "link" ? styles.link : undefined,
        type === "linkItalic" ? styles.linkItalic : undefined,

        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 14,
    // lineHeight: 24,
  },
  defaultItalic: {
    fontSize: 14,
    // lineHeight: 24,
    fontStyle: "italic",
  },
  defaultBold: {
    fontSize: 14,
    // lineHeight: 24,
    fontWeight: "bold",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "semibold",
  },
  small: {
    fontSize: 12,
  },
  smallItalic: {
    fontSize: 12,
    fontStyle: "italic",
  },
  link: {
    fontSize: 14,
    fontWeight: "500",
    color: "#21b0b0",
  },
  linkItalic: {
    fontSize: 14,
    fontWeight: "500",
    color: "#21b0b0",
    fontStyle: "italic",
  },
  extraSmallBold: {
    fontSize: 10,
    fontWeight: "bold",
  },
});
