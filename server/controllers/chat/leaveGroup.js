import ChatDB from "../../models/chat.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

export default async function leaveGroup(req, res, next) {
  try {
    const user = req.user;
    const groupId = req.body.groupId;

    const dbGroup = await ChatDB.findById(groupId);
    if (!dbGroup) throw resError(404, "Group chat not found!");

    // Check if user is member
    const isMember = dbGroup.users.some(
      (u) => u.user.toString() === user._id.toString()
    );
    if (!isMember) throw resError(403, "You are not a member of this group!");

    // Check if user is admin
    const isAdmin = dbGroup.groupAdmins.some(
      (admin) => admin.user.toString() === user._id.toString()
    );
    const isOnlyOneAdmin = isAdmin && dbGroup.groupAdmins.length === 1;

    // 🟡 Add deletedInfos entry
    await ChatDB.findByIdAndUpdate(groupId, {
      $pull: { deletedInfos: { user: user._id } },
    });
    await ChatDB.findByIdAndUpdate(groupId, {
      $addToSet: {
        deletedInfos: {
          user: user._id,
          deletedAt: new Date(),
        },
      },
    });

    // Check if user exists in unreadInfos
    const hasUnreadCount = dbGroup.unreadInfos?.some(
      (entry) => entry.user.toString() === user._id.toString()
    );

    // Build $pull object for arrays of objects
    const pullFields = { users: { user: user._id } };
    if (isAdmin) pullFields.groupAdmins = { user: user._id };
    if (hasUnreadCount) pullFields.unreadInfos = { user: user._id };

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

    return resJson(res, 200, "Success leave group chat.");
  } catch (error) {
    next(error);
  }
}
