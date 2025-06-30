import UserDB from "../../models/user.js";
import ChatDB from "../../models/chat.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

export default async function addAdminsToGroup(req, res, next) {
  try {
    const userId = req.userId;
    const { groupId, userIds } = req.body;

    const [userExists, dbChat] = await Promise.all([
      UserDB.exists({ _id: userId }),
      ChatDB.findById(groupId),
    ]);
    if (!userExists) throw resError(401, "Authenticated user not found!");
    if (!dbChat) throw resError(404, "Group chat not found!");

    // Check if user is admin
    const isAdmin = dbChat.groupAdmins.some(
      (admin) => admin.user.toString() === userId.toString()
    );
    if (!isAdmin) throw resError(403, "Only group admin can add admin!");

    const arrayUserIds = Array.isArray(userIds) ? userIds : JSON.parse(userIds);

    // Check if all userIds exist in DB
    const count = await UserDB.countDocuments({ _id: { $in: arrayUserIds } });
    if (count !== arrayUserIds.length)
      throw resError(404, "One or more users not found.");

    // Check if all userIds are already in the group chat users
    const groupUserIds = dbChat.users.map((u) => u.user.toString());
    const notInGroup = arrayUserIds.filter((id) => !groupUserIds.includes(id));
    if (notInGroup.length)
      throw resError(
        404,
        `Users with id(s) ${notInGroup.join(
          ", "
        )} are not members of the group!`
      );

    // Check if user already admin
    const existingAdminIds = dbChat.groupAdmins.map((admin) =>
      admin.user.toString()
    );
    const alreadyAdmins = arrayUserIds.filter((id) =>
      existingAdminIds.includes(id)
    );
    if (alreadyAdmins.length) {
      throw resError(
        409,
        `User with id ${alreadyAdmins.join(", ")} already admin!`
      );
    }

    const newAdmins = arrayUserIds.map((id) => ({
      user: id,
      joinedAt: new Date(),
    }));

    const updatedChat = await ChatDB.findByIdAndUpdate(
      groupId,
      { $addToSet: { groupAdmins: { $each: newAdmins } } },

      { new: true }
    ).populate({
      path: "users.user groupAdmins.user",
      select: "-password",
    });

    resJson(res, 200, "Success add admin to group chat.", updatedChat);
  } catch (error) {
    next(error);
  }
}
