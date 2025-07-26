// import ChatDB from "../models/chat.js";
// import MessageDB from "../models/message.js";
// import {Redis} from "../config/redisClient.js"; // make sure Redis is imported
// import {
//   REDIS_ONLINE_USERS_KEY,
//   REDIS_USER_ACTIVE_CHATS_KEY,
// } from "../constants/index.js";

// export default async function fetchAll(socket, io) {
//   try {
//     const userId = socket.user._id.toString();

//     // Get all chats this user is part of
//     const chats = await ChatDB.find({ "users.user": userId });

//     for (const chat of chats) {
//       // Check if user is currently viewing this chat screen
//       const recipientChatId = chat._id.toString();
//       const currentChatId = await Redis.hGet(
//         REDIS_USER_ACTIVE_CHATS_KEY,
//         userId
//       );
//       const isInChatScreen = currentChatId === recipientChatId;
//       const newStatus = isInChatScreen ? "seen" : "delivered";

//       // Unreads
//       const unreadInfo = chat.unreadInfos?.find(
//         (info) => info.user.toString() === userId
//       );
//       if (unreadInfo?.count > 0) {
//         const deletedInfo = chat.deletedInfos?.find(
//           (info) => info.user.toString() === userId
//         );
//         const deletedAt = deletedInfo?.deletedAt || null;
//         const messages = await MessageDB.find({
//           chat: chat._id,
//           ...(deletedAt && { createdAt: { $gt: deletedAt } }),
//           status: "sent", // only messages that are still 'sent'
//           sender: { $ne: userId }, // not sent by current user
//         })
//           .sort({ createdAt: -1 })
//           .limit(unreadInfo.count)
//           .populate("sender", "-password")
//           .populate({
//             path: "chat",
//             populate: [
//               {
//                 path: "users.user unreadInfos.user deletedInfos.user initiator",
//                 select: "-password",
//               },
//               { path: "latestMessage" },
//             ],
//           });

//         for (const msg of messages.reverse()) {
//           // Update status to real status
//           await MessageDB.updateOne(
//             { _id: msg._id },
//             { $set: { status: newStatus } }
//           );

//           const updatedMessage = { ...msg.toObject(), status: newStatus };
//           socket.emit("received-message", { message: updatedMessage });

//           socket.emit("new-message", {
//             chatId: msg.chat._id.toString(),
//             message: updatedMessage,
//           });

//           const senderId = msg.sender._id.toString();
//           const senderSocketId = await Redis.hGet(
//             REDIS_ONLINE_USERS_KEY,
//             senderId
//           );
//           if (senderSocketId) {
//             io.to(senderSocketId).emit("new-message", {
//               chatId: msg.chat._id.toString(),
//               message: updatedMessage,
//             });
//           }
//         }
//       }

//       // Always emit the chat itself
//       socket.emit("new-chat", { chat });
//     }
//   } catch (err) {
//     console.error("❌ Failed to resend messages:", err.message);
//     socket.emit("error", { message: "Could not sync missed messages." });
//   }
// }
