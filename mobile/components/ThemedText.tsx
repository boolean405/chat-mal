import { StyleSheet, Text, type TextProps } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?:
    | "default"
    | "defaultBold"
    | "defaultItalic"
    | "title"
    | "subtitle"
    | "headerTitle"
    | "largest"
    | "larger"
    | "large"
    | "smallest"
    | "smaller"
    | "small"
    | "link"
    | "linkItalic";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor(
    { light: lightColor, dark: darkColor },
    "primaryText"
  );

  return (
    <Text
      style={[
        { color },
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "largest" ? styles.largest : undefined,
        type === "large" ? styles.large : undefined,
        type === "small" ? styles.small : undefined,
        type === "smaller" ? styles.smaller : undefined,
        type === "larger" ? styles.larger : undefined,
        type === "link" ? styles.link : undefined,
        type === "linkItalic" ? styles.linkItalic : undefined,
        type === "smallest" ? styles.smallest : undefined,
        type === "defaultBold" ? styles.defaultBold : undefined,
        type === "headerTitle" ? styles.headerTitle : undefined,
        type === "defaultItalic" ? styles.defaultItalic : undefined,

        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 22,
    fontWeight: "semibold",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  largest: {
    fontSize: 20,
    fontWeight: "bold",
    lineHeight: 30,
  },
  larger: {
    fontSize: 18,
  },
  large: {
    fontSize: 16,
  },
  default: {
    fontSize: 14,
  },
  defaultBold: {
    fontSize: 14,
    fontWeight: "bold",
  },
  defaultItalic: {
    fontSize: 14,
    fontStyle: "italic",
  },
  small: {
    fontSize: 12,
  },
  smaller: {
    fontSize: 10,
  },
  smallest: {
    fontSize: 8,
  },
  link: {
    fontSize: 14,
    fontWeight: "semibold",
    color: "#21b0b0",
  },
  linkItalic: {
    fontSize: 14,
    fontWeight: "semibold",
    color: "#21b0b0",
    fontStyle: "italic",
    textDecorationLine: "underline",
  },
});
