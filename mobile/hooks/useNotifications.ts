import { useEffect } from "react";
import * as Device from "expo-device";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { updatePushToken } from "@/api/user";

export function useNotifications() {
  const router = useRouter();

  useEffect(() => {
    // Set up notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    // Request notification permissions
    const requestPermissions = async () => {
      if (Device.isDevice) {
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== "granted") {
          alert("Notification permissions not granted!");
        }
      } else {
        alert("Must use a physical device for push notifications");
      }
    };

    // Register notifications token
    const registerForPushNotifications = async () => {
      const pushToken = (
        await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas.projectId,
        })
      ).data;

      // Send this token to your backend
      await updatePushToken(pushToken);
    };

    // Handle notification taps
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const chatId = response.notification.request.content?.data?.chatId;

        if (chatId) {
          router.push({
            pathname: "/(chat)",
            params: { chatId },
          } as any);
        }
      }
    );

    requestPermissions();
    registerForPushNotifications();

    return () => {
      subscription.remove();
    };
  }, []);
}
