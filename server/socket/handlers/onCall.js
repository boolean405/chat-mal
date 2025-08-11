import { getSocketId } from "../utils/redisHelpers.js";

import ChatDB from "../../models/chat.js";

export default async function onCallHandlers(socket, io) {
  // Request call
  socket.on("request-call", async ({ chatId, callMode }) => {
    try {
      const callerId = socket.user._id;

      // Get the chat from DB with populated user IDs
      const chat = await ChatDB.findById(chatId)
        .populate({
          path: "users.user",
          select: "-password",
        })
        .lean();
      if (!chat) {return;}

      // Extract user IDs excluding caller
      const targetUserIds = chat.users
        .map((u) => u.user._id.toString()) // get only ObjectId string
        .filter((userId) => userId !== callerId.toString());

      // Emit incoming-call to each participant (except caller)
      for (const userId of targetUserIds) {
        const socketId = await getSocketId(userId);
        if (socketId) {
          io.to(socketId).emit("incoming-call", {
            caller: socket.user,
            chat,
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
      if (!chat || !chat.users) {return;}

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
      if (!chat || !Array.isArray(chat.users)) {return;}

      const participantIds = chat.users.map((u) => u.user.toString());

      // Find caller: someone in chat who is NOT the receiver and IS online (i.e., already initiated the call)
      // Optional: track who started the call using a CallSession or in-memory store

      // For now, find any one socket from chat users except the receiver
      for (const userId of participantIds) {
        if (userId === receiverId.toString()) {continue;}

        const callerSocketId = await getSocketId(userId);
        if (callerSocketId) {
          // Emit accepted-call to the first found caller
          io.to(callerSocketId).emit("accepted-call", {
            acceptor: socket.user,
            chatId,
          });
          break; // stop after notifying the caller
        }
      }
    } catch (error) {
      console.log("Error in accept-call:", error.message);
    }
  });

  // Video on and off when calling
  socket.on("toggle-video", async ({ chatId, userId, isVideo }) => {
    try {
      // Get chat participants
      const chat = await ChatDB.findById(chatId).lean();
      if (!chat || !Array.isArray(chat.users)) {return;}

      const participantIds = chat.users.map((u) => u.user.toString());

      // Broadcast to everyone *except* the one who toggled
      for (const participantId of participantIds) {
        if (participantId === userId.toString()) {continue;}

        const socketId = await getSocketId(participantId);
        if (socketId) {
          io.to(socketId).emit("user-toggled-video", {
            userId,
            chatId,
            isVideo,
          });
        }
      }
    } catch (err) {
      console.error("Error in toggle-video:", err.message);
    }
  });

  // Audio on and off when calling
  socket.on("toggle-mute", async ({ chatId, userId, isMuted }) => {
    try {
      // Get chat participants
      const chat = await ChatDB.findById(chatId).lean();
      if (!chat || !Array.isArray(chat.users)) {return;}

      const participantIds = chat.users.map((u) => u.user.toString());

      // Broadcast to everyone *except* the one who toggled
      for (const participantId of participantIds) {
        if (participantId === userId.toString()) {continue;}

        const socketId = await getSocketId(participantId);
        if (socketId) {
          io.to(socketId).emit("user-toggled-mute", {
            userId,
            chatId,
            isMuted,
          });
        }
      }
    } catch (err) {
      console.error("Error in toggle-mute:", err.message);
    }
  });

  // Toggle faced
  socket.on("toggle-face", async ({ chatId, userId, isFaced }) => {
    try {
      // Get chat participants
      const chat = await ChatDB.findById(chatId).lean();
      if (!chat || !Array.isArray(chat.users)) {return;}

      const participantIds = chat.users.map((u) => u.user.toString());

      // Broadcast to everyone *except* the one who toggled
      for (const participantId of participantIds) {
        if (participantId === userId.toString()) {continue;}

        const socketId = await getSocketId(participantId);
        if (socketId) {
          io.to(socketId).emit("user-toggled-face", {
            userId,
            chatId,
            isFaced,
          });
        }
      }
    } catch (err) {
      console.error("Error in toggle-mute:", err.message);
    }
  });

  // --- WebRTC signaling: offer/answer/ice ---
  socket.on("webrtc-offer", async ({ chatId, sdp }) => {
    const fromUserId = socket.user._id.toString();
    const targets = await getOtherParticipantSocketIds(chatId, fromUserId);
    targets.forEach((sid) => {
      io.to(sid).emit("webrtc-offer", { chatId, fromUserId, sdp });
    });
  });

  socket.on("webrtc-answer", async ({ chatId, sdp }) => {
    const fromUserId = socket.user._id.toString();
    const targets = await getOtherParticipantSocketIds(chatId, fromUserId);
    targets.forEach((sid) => {
      io.to(sid).emit("webrtc-answer", { chatId, fromUserId, sdp });
    });
  });

  socket.on("webrtc-ice-candidate", async ({ chatId, candidate }) => {
    const fromUserId = socket.user._id.toString();
    const targets = await getOtherParticipantSocketIds(chatId, fromUserId);
    targets.forEach((sid) => {
      io.to(sid).emit("webrtc-ice-candidate", {
        chatId,
        fromUserId,
        candidate,
      });
    });
  });

  async function getOtherParticipantSocketIds(chatId, excludeUserId) {
    try {
      const chat = await ChatDB.findById(chatId).lean();
      if (!chat || !Array.isArray(chat.users)) {return [];}
      const others = chat.users
        .map((u) => u.user.toString())
        .filter((id) => id !== excludeUserId);
      const socketIds = [];
      for (const uid of others) {
        const sid = await getSocketId(uid);
        if (sid) {socketIds.push(sid);}
      }
      return socketIds;
    } catch {
      return [];
    }
  }
}
