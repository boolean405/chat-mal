import authMiddleware from "./middleware/authMiddleware.js";
import onConnection from "./handlers/onConnection.js";

export default function connectSocket(io) {
  io.of("/")
    .use(authMiddleware)
    .on("connection", (socket) => {
      onConnection(socket, io);
    });
}
