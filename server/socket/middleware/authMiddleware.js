import Token from "../../utils/token.js";
import UserDB from "../../models/user.js";

export default async function authMiddleware(socket, next) {
  try {
    const accessToken = socket.handshake.query.accessToken;
    if (!accessToken) throw new Error("Need authorization token!");

    const decoded = Token.verifyAccessToken(accessToken);
    if (!decoded) throw new Error("Invalid authorization token!");

    const user = await UserDB.findById(decoded.id);
    if (!user) throw new Error("Authenticated user not found!");

    socket.user = user;
    next();
  } catch (err) {
    console.log(err.message);
    next(err);
  }
}
