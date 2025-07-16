import UserDB from "../models/user.js";
import Token from "../utils/token.js";
import Redis from "./redisClient.js";
import { ONLINE_USERS_KEY } from "../constants/index.js";

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
      await Redis.hSet(ONLINE_USERS_KEY, user._id.toString(), socket.id);

      // Broadcast current online users (keys of the hash)
      const onlineUserIds = await Redis.hKeys(ONLINE_USERS_KEY);
      io.emit("online-users", onlineUserIds);

      // Join chat
      socket.on("join-chat", async (chatId) => {
        socket.join(chatId);
        socket.emit("join-chat");

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

      // message chat
      socket.on("send-message", ({ chatId, message }) => {
        io.to(chatId).emit("receive-message", { message });
        io.emit("new-message", { message });
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
        await Redis.hDel(ONLINE_USERS_KEY, user._id.toString());
        const lastOnlineAt = new Date();

        // Save last online timestamp to DB
        await UserDB.findByIdAndUpdate(user._id, {
          lastOnlineAt,
        });

        // Send online user back
        const onlineUserIds = await Redis.hKeys(ONLINE_USERS_KEY);
        io.emit("online-users", onlineUserIds);

        io.emit("user-went-offline", { userId: user._id, lastOnlineAt });
      });
    });
}
