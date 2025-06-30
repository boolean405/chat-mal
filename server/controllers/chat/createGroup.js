import UserDB from "../../models/user.js";
import ChatDB from "../../models/chat.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";
// import generateGroupPhoto from "../../utils/generateGroupPhoto.js";
import uploadGroupPhoto from "../../utils/uploadGroupPhoto.js";

export default async function createGroup(req, res, next) {
  try {
    const userId = req.userId;
    const userIds = req.body.userIds;
    let name = req.body.name;

    if (!(await UserDB.exists({ _id: userId })))
      throw resError(401, "Authenticated user not found!");

    // Parse and validate userIds
    let arrayUserIds = Array.isArray(userIds) ? userIds : JSON.parse(userIds);
    arrayUserIds = [...new Set(arrayUserIds.map((id) => id.toString()))];
    if (!arrayUserIds.includes(userId.toString())) arrayUserIds.push(userId);

    const users = await UserDB.find({ _id: { $in: arrayUserIds } });
    if (users.length !== arrayUserIds.length)
      throw resError(404, "One or more users not found!");

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

    // Generate photo
    // if (!groupPhoto) {
    //   const imageUrls = users
    //     .map((u) => u.profilePhoto)
    //     .filter(Boolean)
    //     .slice(0, 4);
    //   if (imageUrls.length) {
    //     groupPhoto = await generateGroupPhoto(imageUrls);
    //   }
    // }

    // let groupPhotoUrl = null;
    // if (groupPhoto) {
    //   groupPhotoUrl = await uploadGroupPhoto(
    //     null,
    //     "photo",
    //     groupPhoto,
    //     "chat-mal/chats/group-photo"
    //   );
    // }

    const timestamp = new Date();
    const newGroupChat = await ChatDB.create({
      name,
      initiator: userId,
      isGroupChat: true,
      groupPhoto: `${process.env.SERVER_URL}/image/group-photo`,
      users: arrayUserIds.map((id) => ({
        user: id,
        joinedAt: timestamp,
      })),
      groupAdmins: [
        {
          user: userId,
          joinedAt: timestamp,
        },
      ],
    });

    const groupChat = await ChatDB.findById(newGroupChat._id).populate({
      path: "users.user groupAdmins.user initiator",
      select: "-password",
    });

    resJson(res, 201, "Success created group chat.", groupChat);
  } catch (error) {
    next(error);
  }
}
