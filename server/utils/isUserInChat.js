import Redis from "../config/redisClient.js";
import { REDIS_USER_ACTIVE_CHATS_KEY } from "../constants/index.js";

export default async function isUserInChat(userId, chatId) {
  const activeChatId = await Redis.hGet(
    REDIS_USER_ACTIVE_CHATS_KEY,
    userId.toString()
  );
  return activeChatId === chatId;
}
