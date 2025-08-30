import { useEffect } from "react";
import * as Updates from "expo-updates";
import { Alert } from "react-native";

export const useOTAUpdates = () => {
  const { isUpdateAvailable, isUpdatePending } = Updates.useUpdates();

  useEffect(() => {
    if (isUpdateAvailable) {
      Updates.fetchUpdateAsync();
    }
  }, [isUpdateAvailable]);

  useEffect(() => {
    if (isUpdatePending) {
      Alert.alert(
        "Update available",
        "A new version has been downloaded. Apply to restart.",
        [
          {
            text: "Apply",
            onPress: () => Updates.reloadAsync(),
          },
        ]
      );
    }
  }, [isUpdatePending]);
};
