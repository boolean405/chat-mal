import * as Notifications from "expo-notifications";

// Show a local notification
export function showNotification({
  identifier = "default",
  title,
  body,
  data,
}: {
  identifier?: string;
  title: string;
  body: string;
  data: {
    chatId: string;
  };
}) {
  Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title,
      body,
      data,
      sound: "default",
    },
    trigger: null,
  });
}
