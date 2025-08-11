import UserDB from "../../models/user.js";
import ChatDB from "../../models/chat.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

export default async function addAdminToGroup(req, res, next) {
  try {
    const user = req.user;
    const { groupId, userId: targetUserId } = req.body;

    const dbChat = await ChatDB.findById(groupId);
    if (!dbChat) {
      throw resError(404, "Group chat not found!");
    }

    // ✅ Check if current user is an admin or leader
    const isAdminOrLeader = dbChat.users.some(
      (u) =>
        u.user.equals(user._id) && (u.role === "admin" || u.role === "leader")
    );
    if (!isAdminOrLeader) {
      throw resError(403, "Only group admin or leader can add admin!");
    }

    // ✅ Validate target user exists
    const userExists = await UserDB.exists({ _id: targetUserId });
    if (!userExists) {
      throw resError(404, "Target user not found.");
    }

    // ✅ Check if target is in group
    const targetUserEntry = dbChat.users.find((u) =>
      u.user.equals(targetUserId)
    );
    if (!targetUserEntry) {
      throw resError(404, "Target user is not a member of the group!");
    }

    // ✅ Check if already an admin
    if (targetUserEntry.role === "admin") {
      throw resError(409, "User is already an admin!");
    }

    // ✅ Promote to admin
    await ChatDB.updateOne(
      { _id: groupId, "users.user": targetUserId },
      { $set: { "users.$.role": "admin" } }
    );

    const updatedGroup = await ChatDB.findById(groupId)
      .populate({
        path: "users.user deletedInfos.user unreadInfos.user initiator archivedInfos.user",
        select: "-password",
      })
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender",
          select: "-password",
        },
      })
      .lean();

    return resJson(
      res,
      200,
      "Successfully promoted user to admin.",
      updatedGroup
    );
  } catch (error) {
    next(error);
  }
}
