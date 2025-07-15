import UserDB from "../../models/user.js";
import ChatDB from "../../models/chat.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";
import { getIO } from "../../config/socket.js";
import Redis from "../../config/redisClient.js";

export default async function createGroup(req, res, next) {
  try {
    const user = req.user;
    const userIds = req.body.userIds;
    let name = req.body.name;

    // Parse and deduplicate user IDs
    let arrayUserIds = Array.isArray(userIds) ? userIds : JSON.parse(userIds);
    arrayUserIds = [...new Set(arrayUserIds.map((id) => id.toString()))];

    if (!arrayUserIds.includes(user._id.toString()))
      arrayUserIds.push(user._id.toString());

    // Validate users exist
    const users = await UserDB.find({ _id: { $in: arrayUserIds } });
    if (users.length !== arrayUserIds.length)
      throw resError(404, "One or more users not found!");

    // Auto-generate group name if not provided
    if (!name) {
      if (users.length === 2) {
        name = `Group chat ${users[0].name} and ${users[1].name}`;
      } else {
        const [first, ...rest] = users;
        name = `Group chat ${rest[0].name}, ${first.name} +${
          rest.length - 1
        } more`;
      }
    }

    const timestamp = new Date();

    // ✅ Assign roles: creator = leader, others = member
    const usersArray = arrayUserIds.map((id) => ({
      user: id,
      role: id === user._id.toString() ? "leader" : "member",
      joinedAt: timestamp,
    }));

    const newGroupChat = await ChatDB.create({
      name,
      initiator: user._id,
      isGroupChat: true,
      groupPhoto: `${process.env.SERVER_URL}/image/group-photo`,
      users: usersArray,
    });

    const groupChat = await ChatDB.findById(newGroupChat._id).populate({
      path: "users.user initiator",
      select: "-password",
    });

    // Real-time notifications to other users
    const io = getIO();
    await Promise.all(
      groupChat.users.map(async (member) => {
        const memberId = member.user._id.toString();
        if (memberId === user._id.toString()) return;

        const socketId = await Redis.hGet("onlineUsers", memberId);
        if (socketId) {
          io.to(socketId).emit("new-chat", { chat: groupChat });
        }
      })
    );

    return resJson(res, 201, "Successfully created group chat.", groupChat);
  } catch (error) {
    next(error);
  }
}
