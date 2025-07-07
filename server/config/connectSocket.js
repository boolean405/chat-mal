import UserDB from "../models/user.js";
import Token from "../utils/token.js";

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
      console.log("User connected =>", socket.user.name);

      socket.on("join-chat", (chatId) => {
        socket.join(chatId);
        console.log(socket.user.name, "joined chat =>", chatId);

        socket.emit("join-chat");
      });

      socket.on("send-message", (chatId, message) => {
        socket.to(chatId).emit("receive-message", message);
      });

      // ✅ Listen for typing events
      socket.on("typing", (chatId) => {
        socket.to(chatId).emit("typing", chatId, socket.user._id);
      });

      // ✅ Listen for stop typing events
      socket.on("stop-typing", (chatId) => {
        socket.to(chatId).emit("stop-typing", chatId, socket.user._id);
      });

      socket.on("disconnect", () => {
        console.log("User disconnected =>", socket.user.name);
      });
    });
}
