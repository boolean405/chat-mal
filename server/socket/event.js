// import { createRedisAdapter } from "../config/redisClient.js";
// import MessageDB from "../models/message.js";
// import ChatDB from "../models/chat.js";

// // Socket Initialization
// export const initialize = async (io, socket) => {
//   // Setup Redis adapter (Upstash)
//   const adapter = await createRedisAdapter();
//   io.adapter(adapter);
//   socket.currentUserId = socket.user._id;
//   const userId = socket.user._id;
//   console.log("✅ Socket connected:", socket.currentUserId);

//   socket.on("join-chat", (chatId, userId) => {
//     socket.join(chatId);
//     console.log(`👤 ${userId} joined chat room ${chatId}`);
//   });

//   /**
//    * Handle message sending
//    * @param { chatId, userId, content }
//    */
//   socket.on("sendMessage", async (chatId, userId, content) => {
//     if (!chatId || !userId || !content) return;

//     try {
//       // Create and save message
//       const newMessage = await MessageDB.create({
//         sender: userId,
//         chat: chatId,
//         type,
//         content,
//       });

//       // Update latest message in the chat
//       const message = await MessageDB.findById(newMessage._id)
//         .populate({
//           path: "sender",
//           select: "-password",
//         })
//         .populate({
//           path: "chat",
//           populate: {
//             path: "users.user",
//             select: "-password",
//           },
//         });

//       if (message)
//         await ChatDB.findByIdAndUpdate(chatId, { latestMessage: message });

//       // Emit message to all users in the chat room
//       io.to(chatId).emit("newMessage", message);
//     } catch (error) {
//       console.error("❌ sendMessage error:", error.message);
//     }
//   });

//   /**
//    * Typing indicator
//    * @param { chatId, userId, isTyping }
//    */
//   socket.on("typing", ({ chatId, userId, isTyping }) => {
//     socket.to(chatId).emit("typing", { userId, isTyping });
//   });

//   socket.on("disconnect", () => {
//     console.log("🚪 Socket disconnected:", socket.id);
//   });
// };
