import UserDB from "../models/user.js";
import ChatDB from "../models/chat.js";
import MessageDB from "../models/message.js";
import Token from "../utils/token.js";
import Redis from "./redisClient.js";
import {
  REDIS_ONLINE_USERS_KEY,
  REDIS_USER_ACTIVE_CHATS_KEY,
} from "../constants/index.js";

import fetchAll from "../socket/fetchAll.js";
import readChatService from "../services/readChatService.js";
import { sendPushNotifications } from "../utils/sendPushNotifications.js";
import isUserInChat from "../utils/isUserInChat.js";

export default function connectSocket(io) {
  io.of("/")
    .use(async (socket, next) => {
      try {
        const accessToken = socket.handshake.query.accessToken;
        if (!accessToken) throw new Error("Need authorization token!");

        const decoded = Token.verifyAccessToken(accessToken);
        if (!decoded) throw new Error("Invalid authorization token!");

        const user = await UserDB.findById(decoded.id);
        if (!user) throw new Error("User not found!");

        socket.user = user;
        next();
      } catch (error) {
        console.log(error.message);
        next(error);
      }
    })
    .on("connection", async (socket) => {
      const user = socket.user;
      console.log("✅ User connected:", user.name);

      // Add user to Redis set of online users
      await Redis.hSet(REDIS_ONLINE_USERS_KEY, user._id.toString(), socket.id);

      // Broadcast current online users (keys of the hash)
      const onlineUserIds = await Redis.hKeys(REDIS_ONLINE_USERS_KEY);
      io.emit("online-users", onlineUserIds);

      // Join chat
      socket.on("join-chat", async (chatId) => {
        socket.join(chatId);
        socket.emit("join-chat");
        await Redis.hSet(
          REDIS_USER_ACTIVE_CHATS_KEY,
          user._id.toString(),
          chatId
        );
        // Mark read chat
        try {
          const updatedChat = await readChatService(user._id, chatId);

          // Emit to all users in that chat (except the one who triggered it)
          socket.to(chatId).emit("chat-read", {
            chatId,
            userId: user._id,
          });
        } catch (err) {
          console.error("Error in readChatService:", err.message);
        }
      });

      // Leave chat
      socket.on("leave-chat", async (chatId) => {
        socket.leave(chatId);

        const userInChatId = await Redis.hGet(
          REDIS_USER_ACTIVE_CHATS_KEY,
          user._id.toString()
        );

        // Clean up from the active chat tracking map
        if (userInChatId === chatId) {
          await Redis.hDel(REDIS_USER_ACTIVE_CHATS_KEY, user._id.toString());
        }
      });

      // message chat
      socket.on("send-message", async ({ chatId, message }) => {
        const chat = await ChatDB.findById(chatId);
        if (!chat) return;

        const otherUsers = chat.users
          .filter((u) => !u.user.equals(user._id))
          .map((u) => u.user.toString());

        let updatedStatus = "sent"; // default fallback

        for (const otherUserId of otherUsers) {
          const socketId = await Redis.hGet(
            REDIS_ONLINE_USERS_KEY,
            otherUserId
          );
          const isOnline = !!socketId;

          const activeChatId = await Redis.hGet(
            REDIS_USER_ACTIVE_CHATS_KEY,
            otherUserId
          );
          const isInChat = activeChatId === chatId;

          if (isInChat) {
            // Update status to 'seen'
            await MessageDB.updateMany(
              {
                chat: chatId,
                sender: user._id,
                status: { $ne: "seen" },
              },
              { $set: { status: "seen" } }
            );

            await ChatDB.updateOne(
              { _id: chatId, "unreadInfos.user": otherUserId },
              { $set: { "unreadInfos.$.count": 0 } }
            );

            io.to(chatId).emit("chat-read", {
              chatId,
              userId: otherUserId,
            });

            updatedStatus = "seen";
          }
          // User online change status to delivered
          else if (isOnline) {
            // Update status to 'delivered'
            await MessageDB.updateOne(
              { _id: message._id },
              { $set: { status: "delivered" } }
            );
            updatedStatus = "delivered";
          }
          // User offline send notifications
          else if (!isOnline) {
            await sendPushNotifications(
              message.chat.users,
              user._id,
              message.chat.name || message.sender.name,
              message.content,
              {
                chatId,
                messageId: message._id,
              }
            );
            // Make as already pushed notification from server
            await MessageDB.updateOne(
              { _id: message._id },
              { $set: { isNotify: true } }
            );
          }
        }

        // Update local `message` object before broadcasting
        const updatedMessage = {
          ...message,
          status: updatedStatus,
        };

        // Broadcast to all clients in the chat (including sender)
        io.to(chatId).emit("received-message", {
          message: updatedMessage,
        });

        // Also send to clients not in the chat (e.g. to update preview in home screen)
        for (const otherUserId of otherUsers) {
          const socketId = await Redis.hGet(
            REDIS_ONLINE_USERS_KEY,
            otherUserId
          );
          if (socketId) {
            io.to(socketId).emit("new-message", {
              chatId,
              message: updatedMessage,
            });
          }
        }
      });

      // Typing
      socket.on("typing", ({ chatId, user }) => {
        socket.to(chatId).emit("typing", { chatId, user });
      });

      // Stop typing
      socket.on("stop-typing", ({ chatId, user }) => {
        socket.to(chatId).emit("stop-typing", { chatId, user });
      });

      // Fetch all after online
      socket.on("fetch-all", () => fetchAll(io, socket));

      // Disconnect
      socket.on("disconnect", async () => {
        // Remove in redis
        await Redis.hDel(REDIS_ONLINE_USERS_KEY, user._id.toString());
        await Redis.hDel(REDIS_USER_ACTIVE_CHATS_KEY, user._id.toString());

        const lastOnlineAt = new Date();

        // Save last online timestamp to DB
        await UserDB.findByIdAndUpdate(user._id, {
          lastOnlineAt,
        });

        // Send online user back
        const onlineUserIds = await Redis.hKeys(REDIS_ONLINE_USERS_KEY);
        io.emit("online-users", onlineUserIds);

        io.emit("user-went-offline", { userId: user._id, lastOnlineAt });
      });
    });
}
