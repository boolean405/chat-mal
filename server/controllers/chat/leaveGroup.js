import ChatDB from "../../models/chat.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

export default async function leaveGroup(req, res, next) {
  try {
    const user = req.user;
    const groupId = req.body.groupId;

    const dbGroup = await ChatDB.findById(groupId);
    if (!dbGroup) throw resError(404, "Group chat not found!");

    const userIdStr = user._id.toString();

    // 🟡 Find user's entry in group
    const userEntry = dbGroup.users.find(
      (u) => u.user.toString() === userIdStr
    );
    if (!userEntry) throw resError(403, "You are not a member of this group!");

    const isLeader = userEntry.role === "leader";
    const isAdmin = userEntry.role === "admin";

    // Check if this user is the only admin
    const allAdmins = dbGroup.users.filter((u) => u.role === "admin");
    const isOnlyOneAdmin = isAdmin && allAdmins.length === 1;

    // 🔄 Add deletedInfos entry
    await ChatDB.updateOne(
      { _id: groupId },
      {
        $pull: { deletedInfos: { user: user._id } },
      }
    );
    await ChatDB.updateOne(
      { _id: groupId },
      {
        $addToSet: {
          deletedInfos: {
            user: user._id,
            deletedAt: new Date(),
          },
        },
      }
    );

    // Remove user from users[] and unreadInfos[]
    const pullFields = {
      users: { user: user._id },
      unreadInfos: { user: user._id },
    };

    const updatedGroup = await ChatDB.findByIdAndUpdate(
      groupId,
      { $pull: pullFields },
      { new: true }
    ).populate({
      path: "users.user",
      select: "-password",
    });

    // 🔁 Handle leadership/admin reassignment
    if ((isLeader || isOnlyOneAdmin) && updatedGroup.users.length > 0) {
      const sortedUsers = [...updatedGroup.users].sort(
        (a, b) => new Date(a.joinedAt) - new Date(b.joinedAt)
      );
      const newLeader = sortedUsers[0];

      if (newLeader) {
        const newRole = isLeader ? "leader" : "admin";

        await ChatDB.updateOne(
          { _id: groupId, "users.user": newLeader.user._id },
          {
            $set: {
              "users.$.role": newRole,
              ...(isLeader ? { initiator: newLeader.user._id } : {}),
            },
          }
        );
      }
    }

    return resJson(res, 200, "Successfully left group chat.");
  } catch (error) {
    next(error);
  }
}
