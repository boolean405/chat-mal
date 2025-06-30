import UserDB from "../models/user.js";
import resError from "../utils/resError.js";
import Token from "../utils/token.js";
import { initialize } from "./chat.js";

export function setupSocket(io) {
  io.of("/api/chat")
    .use(async (socket, next) => {
      try {
        const accessToken = socket.handshake.query.accessToken;
        if (!accessToken) throw new Error("Need Authorization!");

        const decoded = Token.verifyAccessToken(accessToken);
        if (!decoded) throw new Error("Invalid Authorization!");

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
      initialize(io, socket);
    });
}
