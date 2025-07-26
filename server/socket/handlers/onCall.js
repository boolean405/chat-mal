import { getSocketId } from "../utils/redisHelpers.js";

import ChatDB from "../../models/chat.js";

export default async function onCallHandlers(socket, io) {
  // Request call
  socket.on("request-call", async ({ chatId, callMode }) => {
    try {
      const callerId = socket.user._id;

      // Get the chat from DB with populated user IDs
      const chat = await ChatDB.findById(chatId).lean();
      if (!chat || !Array.isArray(chat.users)) return;

      // Extract user IDs excluding caller
      const targetUserIds = chat.users
        .map((u) => u.user.toString()) // get only ObjectId string
        .filter((userId) => userId !== callerId.toString());

      // Emit incoming-call to each participant (except caller)
      for (const userId of targetUserIds) {
        const socketId = await getSocketId(userId);
        if (socketId) {
          io.to(socketId).emit("incoming-call", {
            from: socket.user,
            chatId,
            callMode,
          });
        }
      }
    } catch (error) {
      console.log("Error in request-call:", error.message);
    }
  });

  // End call
  socket.on("end-call", async ({ chatId }) => {
    try {
      const callerId = socket.user._id;

      // Fetch chat to get all participants
      const chat = await ChatDB.findById(chatId).lean();
      if (!chat || !chat.users) return;

      const participantIds = chat.users
        .map((u) => u.user.toString())
        .filter((id) => id !== callerId.toString());

      // Notify all participants (except the one who ended the call)
      for (const userId of participantIds) {
        const socketId = await getSocketId(userId);
        if (socketId) {
          io.to(socketId).emit("ended-call", {
            chatId,
            // endedBy: callerId,
          });
        }
      }
    } catch (error) {
      console.log("Error in end-call:", error.message);
    }
  });

  // Accept call
  socket.on("accept-call", async ({ chatId }) => {
    try {
      const receiverId = socket.user._id;

      // Get chat participants
      const chat = await ChatDB.findById(chatId).lean();
      if (!chat || !Array.isArray(chat.users)) return;

      const participantIds = chat.users.map((u) => u.user.toString());

      // Find caller: someone in chat who is NOT the receiver and IS online (i.e., already initiated the call)
      // Optional: track who started the call using a CallSession or in-memory store

      // For now, find any one socket from chat users except the receiver
      for (const userId of participantIds) {
        if (userId === receiverId.toString()) continue;

        const callerSocketId = await getSocketId(userId);
        if (callerSocketId) {
          // Emit accepted-call to the first found caller
          io.to(callerSocketId).emit("accepted-call", {
            from: socket.user,
            chatId,
          });
          break; // stop after notifying the caller
        }
      }
    } catch (error) {
      console.log("Error in accept-call:", error.message);
    }
  });

  socket.on("webrtc-offer", ({ to, offer }) => {
    io.to(to).emit("webrtc-offer", { from: socket.user._id, offer });
  });

  socket.on("webrtc-answer", ({ to, answer }) => {
    io.to(to).emit("webrtc-answer", { from: socket.user._id, answer });
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("ice-candidate", { from: socket.user._id, candidate });
  });
}
