import { Redis } from "../../config/redisClient.js";
import {
  REDIS_ONLINE_USERS_KEY,
  REDIS_USER_ACTIVE_CHATS_KEY,
} from "../../constants/index.js";

export const addUserOnline = async (userId, socketId) =>
  await Redis.hSet(REDIS_ONLINE_USERS_KEY, userId, socketId);

export const removeUserOnline = async (userId) =>
  Redis.hDel(REDIS_ONLINE_USERS_KEY, userId);

export const getOnlineUsers = async () => Redis.hKeys(REDIS_ONLINE_USERS_KEY);

export const getSocketId = async (userId) =>
  await Redis.hGet(REDIS_ONLINE_USERS_KEY, userId);

export const setUserActiveChat = async (userId, chatId) =>
  await Redis.hSet(REDIS_USER_ACTIVE_CHATS_KEY, userId, chatId);

export const getUserActiveChat = async (userId) =>
  await Redis.hGet(REDIS_USER_ACTIVE_CHATS_KEY, userId);

export const clearUserActiveChat = async (userId) =>
  await Redis.hDel(REDIS_USER_ACTIVE_CHATS_KEY, userId);

// Get socket IDs for multiple user IDs
export const getSocketIdsByUserIds = async (userIds) => {
  const multi = Redis.multi();

  userIds.forEach((userId) => {
    multi.hGet(REDIS_ONLINE_USERS_KEY, userId);
  });

  const socketIds = await multi.exec();

  return socketIds.filter(Boolean);
};
