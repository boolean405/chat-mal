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
          const updatedChat = await readChatService(socket.user._id, chatId);

          // Emit to all users in that chat (except the one who triggered it)
          socket.to(chatId).emit("chat-read", {
            chatId,
            userId: socket.user._id,
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

        // Optionally log
        console.log(`${socket.user.name} left chat ${chatId}`);
      });

      // message chat
      socket.on("send-message", async ({ chatId, message }) => {
        // Emit message to all clients in chat
        io.to(chatId).emit("receive-message", { message });

        // Check if all chat participants are active in this chat
        const chat = await ChatDB.findById(chatId);
        if (!chat) return;

        const otherUsers = chat.users
          .filter((u) => !u.user.equals(user._id))
          .map((u) => u.user.toString());

        for (const otherUserId of otherUsers) {
          const otherUserChatId = await Redis.hGet(
            REDIS_USER_ACTIVE_CHATS_KEY,
            otherUserId
          );

          const userInChat = otherUserChatId === chatId;

          if (userInChat) {
            // Mark as seen
            await MessageDB.updateMany(
              {
                chat: chatId,
                sender: socket.user._id,
                status: { $ne: "seen" },
              },
              { $set: { status: "seen" } }
            );

            // Reset unread count
            await ChatDB.updateOne(
              { _id: chatId, "unreadInfos.user": otherUserId },
              { $set: { "unreadInfos.$.count": 0 } }
            );

            // Emit read status
            io.to(chatId).emit("chat-read", {
              chatId,
              userId: otherUserId,
            });
          } else {
            io.emit("new-message", { chatId, message });
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
        // Remove user from Redis online users hash
        await Redis.hDel(REDIS_ONLINE_USERS_KEY, user._id.toString());
        const lastOnlineAt = new Date();

        // Save last online timestamp to DB
        await UserDB.findByIdAndUpdate(user._id, {
          lastOnlineAt,
        });

        // Send online user back
        const onlineUserIds = await Redis.hKeys(REDIS_ONLINE_USERS_KEY);
        io.emit("online-users", onlineUserIds);

        io.emit("user-went-offline", { userId: user._id, lastOnlineAt });

        // Delete in redis
        await Redis.hDel(REDIS_USER_ACTIVE_CHATS_KEY, user._id.toString());
      });
    });
}
