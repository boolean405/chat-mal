import { useEffect } from "react";
import * as Device from "expo-device";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { updatePushToken } from "@/api/user";
import { Platform } from "react-native";
import { socket } from "@/config/socket";

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

    // Set Android notification channel for heads-up & sound
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        sound: "default",
        enableVibrate: true,
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PRIVATE,
      });
    }

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
        // alert("Must use a physical device for push notifications");
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
      async (response) => {
        const chatId = response.notification.request.content?.data?.chatId;
        const action = response.actionIdentifier;
        console.log(action);

        if (action === Notifications.DEFAULT_ACTION_IDENTIFIER) {
          if (chatId) {
            router.push({
              pathname: "/(chat)",
              params: { chatId },
            } as any);
            socket.emit("read-chat", chatId);
          }
          return;
        }

        if (action === "ACCEPT") {
          Notifications.dismissNotificationAsync(
            response.notification.request.identifier
          );
          // socket.emit("accept-call", { chatId });
          router.push(`/(chat)/call`);
        }

        if (action === "DECLINE") {
          Notifications.dismissNotificationAsync(
            response.notification.request.identifier
          );
          // socket.emit("end-call", { chatId });
        }

        if (action === "REPLY") {
          Notifications.dismissNotificationAsync(
            response.notification.request.identifier
          );
          router.push({
            pathname: "/(chat)",
            params: { chatId },
          } as any);
        }

        if (action === "READ") {
          Notifications.dismissNotificationAsync(
            response.notification.request.identifier
          );
          socket.emit("read-chat", chatId);
        }
      }
    );

    // Actions buttons in notifications
    Notifications.setNotificationCategoryAsync("message", [
      {
        identifier: "REPLY",
        buttonTitle: "Reply",
        options: { opensAppToForeground: true },
      },
      {
        identifier: "READ",
        buttonTitle: "Mark as read",
        options: {},
      },
    ]);

    Notifications.setNotificationCategoryAsync("call", [
      {
        identifier: "ACCEPT",
        buttonTitle: "Accept",
        options: { opensAppToForeground: true },
      },
      {
        identifier: "DECLINE",
        buttonTitle: "Decline",
        options: { isDestructive: true },
      },
    ]);

    requestPermissions();
    registerForPushNotifications();

    return () => {
      subscription.remove();
    };
  }, [router]);
}
