import { Expo } from "expo-server-sdk";

// Create a single instance (reused)
const expo = new Expo();

export async function sendPushNotifications(
  users,
  senderId,
  title,
  body,
  data
) {
  const notifications = [];

  for (const user of users) {
    // Skip the sender
    if (user.user._id.toString() === senderId.toString()) {
      continue;
    }

    // Skip if no push token
    if (!user.user.pushToken || !Expo.isExpoPushToken(user.user.pushToken)) {
      console.warn(`⚠️ Invalid Expo push token for user ${user.user._id}`);
      continue;
    }

    // 4. Prepare the notification
    notifications.push({
      to: user.user.pushToken,
      title,
      body,
      data,
      sound: "default",
      priority: "high",
      channelId: "default",
      android: { collapseKey: data.chatId },
      apns: { headers: { "apns-collapse-id": data.chatId } },
    });
  }

  // Chunk and send notifications (Expo limits batch size to 100)
  const chunks = expo.chunkPushNotifications(notifications);
  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (error) {
      console.log("❌ Failed to send push notifications:", error);
    }
  }
}
