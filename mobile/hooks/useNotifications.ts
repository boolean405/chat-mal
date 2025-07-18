import { useEffect } from "react";
import * as Device from "expo-device";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";

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

    // Handle notification taps
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content?.data;

        const chatId = data?.chatId;

        if (chatId) {
          router.push({
            pathname: "/(chat)",
            params: { chatId },
          } as any);
        }
      }
    );

    requestPermissions();

    return () => {
      subscription.remove();
    };
  }, []);
}
