import * as Notifications from "expo-notifications";

// Show a local notification
export function showNotification({
  title,
  body,
  data,
}: {
  title: string;
  body: string;
  data?: {
    chatId?: string;
    messageId?: string;
  };
}) {
  Notifications.scheduleNotificationAsync({
    identifier: data?.chatId || "default",
    content: {
      title,
      body,
      data,
      sound: "default",
    },
    trigger: null,
  });
}
