import UserDB from "../../models/user.js";
import ChatDB from "../../models/chat.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

export default async function removeUserFromGroup(req, res, next) {
  try {
    const userId = req.userId;
    const { groupId, userId: targetUserId } = req.body;

    const [dbUser, userExists, dbChat] = await Promise.all([
      UserDB.exists({ _id: userId }),
      UserDB.exists({ _id: targetUserId }),
      ChatDB.findById(groupId),
    ]);

    if (!dbUser) throw resError(401, "Authenticated user not found!");
    if (!userExists) throw resError(404, "Target user not found!");
    if (!dbChat) throw resError(404, "Group chat not found!");

    const isTargetMember = dbChat.users.some(
      (u) => u.user?.toString() === targetUserId
    );

    if (!isTargetMember)
      throw resError(404, "Target user is not a member of this group chat.");

    const isAuthMember = dbChat.users.some((u) => u.user?.toString() === userId);

    if (!isAuthMember)
      throw resError(403, "You are not a member of this group chat.");

    const isAdmin = dbChat.groupAdmins.some((a) => a.user?.toString() === userId);

    if (!isAdmin) throw resError(403, "Only group admin can remove member!");

    const isTargetAdmin = dbChat.groupAdmins.some(
      (a) => a.user?.toString() === targetUserId
    );

    if (isTargetAdmin)
      throw resError(
        400,
        "Cannot remove a group admin. Remove admin role first!"
      );

    const updatedChat = await ChatDB.findByIdAndUpdate(
      groupId,
      { $pull: { users: { user: targetUserId } } },
      { new: true }
    ).populate({
      path: "users.user groupAdmins.user",
      select: "-password",
    });
    resJson(res, 200, "Success remove member from group chat.", updatedChat);
  } catch (error) {
    next(error);
  }
}
