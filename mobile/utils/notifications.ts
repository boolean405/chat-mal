import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

export async function setupNotificationPermissions() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

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
}

export function showNotification({
  title,
  body,
  data,
}: {
  title: string;
  body: string;
  data: {
    chatId: string;
  };
}) {
  Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: "default",
    },
    trigger: null,
  });
}
