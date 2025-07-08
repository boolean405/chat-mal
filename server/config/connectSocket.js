import UserDB from "../models/user.js";
import Token from "../utils/token.js";

let onlineUsers = new Map();

export default function connectSocket(io) {
  io.of("/api/socket/chat")
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
    .on("connection", (socket) => {
      const userId = socket.user._id;
      console.log("User connected =>", socket.user.name);

      // Online user
      onlineUsers.set(socket.user.id, socket.id);
      io.emit("user-online", userId);

      // Join chat
      socket.on("join-chat", (chatId) => {
        socket.join(chatId);
        console.log(socket.user.name, "joined chat =>", chatId);
        socket.emit("join-chat");
      });

      // message chat
      socket.on("send-message", (chatId, message) => {
        socket.to(chatId).emit("receive-message", message);
      });

      // Typing
      socket.on("typing", ({ chatId, user }) => {
        socket.to(chatId).emit("typing", { chatId, user });
      });

      socket.on("stop-typing", ({ chatId, user }) => {
        socket.to(chatId).emit("stop-typing", { chatId, user });
      });

      // Disconnect
      socket.on("disconnect", () => {
        onlineUsers.delete(userId);
        // Notify others
        io.emit("user-offline", userId);
        console.log("User disconnected =>", socket.user.name);
      });
    });
}
