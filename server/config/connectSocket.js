import UserDB from "../models/user.js";
import Token from "../utils/token.js";

let onlineUsers = new Map();

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
    .on("connection", (socket) => {
      const user = socket.user;
      console.log("User connected =>", socket.user.name);

      // Online user
      onlineUsers.set(user._id, socket.id);
      io.of("/").emit("online-users", Array.from(onlineUsers.keys()));

      // Join chat
      socket.on("join-chat", (chatId) => {
        socket.join(chatId);
        console.log(socket.user.name, "joined chat =>", chatId);
        socket.emit("join-chat");
      });

      // message chat
      socket.on("send-message", ({ chatId, message }) => {
        io.to(chatId).emit("receive-message", { message });
        // Send to everyone for chat list latestMessage update
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

      // Disconnect
      socket.on("disconnect", async () => {
        onlineUsers.delete(user._id);

        // Save last online timestamp to DB
        await UserDB.findByIdAndUpdate(user._id, {
          lastOnlineAt: new Date(),
        });

        // Send online user back
        io.emit("online-users", Array.from(onlineUsers.keys()));
      });
    });
}
