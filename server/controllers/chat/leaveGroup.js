import UserDB from "../../models/user.js";
import ChatDB from "../../models/chat.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

export default async function leaveGroup(req, res, next) {
  try {
    const userId = req.userId;
    const groupId = req.body.groupId;

    const [userExists, dbGroup] = await Promise.all([
      UserDB.exists({ _id: userId }),
      ChatDB.findById(groupId),
    ]);

    if (!userExists) throw resError(401, "Authenticated user not found!");
    if (!dbGroup) throw resError(404, "Group chat not found!");

    // Check if user is member
    const isMember = dbGroup.users.some(
      (u) => u.user.toString() === userId.toString()
    );
    if (!isMember) throw resError(403, "You are not a member of this group!");

    // Check if user is admin
    const isAdmin = dbGroup.groupAdmins.some(
      (admin) => admin.user.toString() === userId.toString()
    );
    const isOnlyOneAdmin = isAdmin && dbGroup.groupAdmins.length === 1;

    // 🟡 Add deletedInfos entry
    await ChatDB.findByIdAndUpdate(groupId, {
      $addToSet: {
        deletedInfos: {
          user: userId,
          deletedAt: new Date(),
        },
      },
    });

    // Build $pull object for arrays of objects
    const pullFields = { users: { user: userId } };
    if (isAdmin) pullFields.groupAdmins = { user: userId };

    // Remove user from users and admins if admin
    const updatedGroup = await ChatDB.findByIdAndUpdate(
      groupId,
      { $pull: pullFields },
      { new: true }
    ).populate({
      path: "users.user groupAdmins.user",
      select: "-password",
    });

    // If only admin left, assign new admin from remaining users
    if (isOnlyOneAdmin && updatedGroup.groupAdmins.length === 0) {
      const sortedUsers = [...updatedGroup.users].sort(
        (a, b) => new Date(a.joinedAt) - new Date(b.joinedAt)
      );
      const newAdminUser = sortedUsers[0]?.user;
      if (newAdminUser) {
        await ChatDB.findByIdAndUpdate(groupId, {
          $addToSet: {
            groupAdmins: { user: newAdminUser, joinedAt: new Date() },
          },
        });
      }
    }

    resJson(res, 200, "Success leave group chat.");
  } catch (error) {
    next(error);
  }
}
