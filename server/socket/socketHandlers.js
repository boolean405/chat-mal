// // socketHandlers.js
// export default function socketHandlers(io, socket, onlineUsers) {
//   const user = socket.user;
//   console.log("User connected =>", user.name);

//   // Add user to onlineUsers map
//   onlineUsers.set(user._id, socket.id);
//   io.of("/").emit("online-users", Array.from(onlineUsers.keys()));

//   // Join chat
//   socket.on("join-chat", (chatId) => {
//     socket.join(chatId);
//     console.log(user.name, "joined chat =>", chatId);
//     socket.emit("join-chat");
//   });

//   // Send message
//   socket.on("send-message", ({ chatId, message }) => {
//     io.to(chatId).emit("receive-message", { message });
//     io.emit("new-message", { message });
//   });

//   // Typing
//   socket.on("typing", ({ chatId, user }) => {
//     socket.to(chatId).emit("typing", { chatId, user });
//   });

//   // Stop typing
//   socket.on("stop-typing", ({ chatId, user }) => {
//     socket.to(chatId).emit("stop-typing", { chatId, user });
//   });

//   // Disconnect
//   socket.on("disconnect", async () => {
//     onlineUsers.delete(user._id);
//     const lastOnlineAt = new Date();

//     // Save last online timestamp to DB
//     await import("../models/user.js").then(({ default: UserDB }) =>
//       UserDB.findByIdAndUpdate(user._id, { lastOnlineAt })
//     );

//     io.emit("online-users", Array.from(onlineUsers.keys()));
//     io.emit("user-went-offline", { userId: user._id, lastOnlineAt });
//   });
// }
