import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { useUiStore } from "@/stores/uiStore";

export default function useTimeTickWhenFocused() {
  const updateTick = useUiStore((state) => state.updateTick);

  useFocusEffect(
    useCallback(() => {
      const interval = setInterval(() => {
        updateTick();
      }, 60 * 1000);

      return () => clearInterval(interval);
    }, [updateTick])
  );
}
