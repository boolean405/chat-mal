/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#000000";
const tintColorDark = "#ffffff";
// const tintColorDark = "#FF81AE";

export const Colors = {
  light: {
    text: "#000",
    main: "#e0408f",
    primary: "#000",
    // secondary: "#F5F5F5",
    secondary: "#eee",
    background: "#fff",
    borderColor: "#333",
    tint: tintColorLight,
    icon: "#000",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#fff",
    main: "#e0408f",
    primary: "#ffff",
    // secondary: "#111",
    secondary: "#222",
    background: "#000",
    borderColor: "#ccc",
    tint: tintColorDark,
    icon: "#fff",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};
