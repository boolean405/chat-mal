import * as Notifications from "expo-notifications";

// Show a local notification
export async function showNotification({
  title,
  body,
  data,
  type,
}: {
  title: string;
  body: string;
  type: "message" | "call";
  data?: {
    chatId?: string;
    messageId?: string;
  };
}) {
  await Notifications.scheduleNotificationAsync({
    identifier: data?.chatId || "default",
    content: {
      title,
      body,
      data,
      sound: "default",
      categoryIdentifier: type,
      sticky: type === "call",
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: null,
  });
}
