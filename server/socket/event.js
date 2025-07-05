import { redisClient } from "../config/redisClient.js";
import {
  addUserSocket,
  getUserSockets,
  removeUserSocket,
} from "./userSocket.js";

export default function registerSocketEvents(io, socket) {
  // JOIN
  socket.on("join", async (userId) => {
    socket.data.userId = userId;
    await addUserSocket(redisClient, userId, socket.id);
    console.log(`✅ User ${userId} joined with socket ${socket.id}`);
  });

  // SEND MESSAGE
  socket.on("send-message", async ({ chatId, receiverId, newMessage }) => {
    const socketIds = await getUserSockets(redisClient, receiverId);
    for (const sid of socketIds) {
      io.to(sid).emit("receive-message", { chatId, newMessage });
    }
  });

  // TYPING
  socket.on("typing", async ({ toUserId }) => {
    const receivers = await getUserSockets(redisClient, toUserId);
    for (const sid of receivers) {
      io.to(sid).emit("typing", { fromUserId: socket.data.userId });
    }
  });

  // DISCONNECT
  socket.on("disconnect", async () => {
    const userId = socket.data.userId;
    if (userId) {
      await removeUserSocket(redisClient, userId, socket.id);
      console.log(`🔴 Socket ${socket.id} (User ${userId}) disconnected`);
    }
  });
}
