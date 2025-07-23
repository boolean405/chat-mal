import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from "./ThemedView";
import { useSegments } from "expo-router";

export default function SafeScreen({ children }: React.PropsWithChildren) {
  const insets = useSafeAreaInsets();
  const segments = useSegments();

  const NoBottomPaddingList = ["(tab)", "image-viewer"];
  const NoTopPaddingList = ["image-viewer"];

  const isNoBottomPaddingLayout = segments.some((segment) =>
    NoBottomPaddingList.includes(segment)
  );
  const isNoTopPaddingLayout = segments.some((segment) =>
    NoTopPaddingList.includes(segment)
  );

  return (
    <ThemedView
      style={{
        flex: 1,
        paddingTop: isNoTopPaddingLayout ? 0 : insets.top,
        paddingBottom: isNoBottomPaddingLayout ? 0 : insets.bottom,
      }}
    >
      {children}
    </ThemedView>
  );
}
