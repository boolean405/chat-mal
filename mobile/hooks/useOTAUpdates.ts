import { useEffect } from "react";
import * as Updates from "expo-updates";
import { Alert, AppState, AppStateStatus } from "react-native";

export default function useOTAUpdates() {
  const { isUpdateAvailable, isUpdatePending } = Updates.useUpdates();

  useEffect(() => {
    if (isUpdateAvailable) {
      Updates.fetchUpdateAsync();
    }
  }, [isUpdateAvailable]);

  useEffect(() => {
    if (isUpdatePending) {
      Alert.alert(
        "Updated available",
        "Restart app to apply the latest version.",
        [
          {
            text: "Apply",
            onPress: () => Updates.reloadAsync(),
          },
        ]
      );
    }
  }, [isUpdatePending]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state: AppStateStatus) => {
      if (state === "active") {
        if (isUpdateAvailable) {
          Updates.fetchUpdateAsync();
        }
      }
    });
    return () => sub.remove();
  }, [isUpdateAvailable]);
}
