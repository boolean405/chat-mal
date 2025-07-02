import UserDB from "../../models/user.js";
import ChatDB from "../../models/chat.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

export default async function getPaginateRequestChat(req, res, next) {
  try {
    const userId = req.userId;
    const page = parseInt(req.params.pageNum);

    if (!(await UserDB.exists({ _id: userId })))
      throw resError(401, "Authenticated user not found!");

    if (isNaN(page)) throw resError(400, "Page number must be a valid number!");

    if (page <= 0) throw resError(400, "Page number must be greater than 0!");

    const limit = Number(process.env.PAGINATE_LIMIT) || 15;
    const skipCount = limit * (page - 1);

    const filter = {
      latestMessage: { $ne: null },
      isPending: true, // only pending requests
      "users.user": userId, // user is one of the chat members
      initiator: { $ne: userId }, // NOT initiated by the current user
    };

    const [chats, totalChat] = await Promise.all([
      ChatDB.find(filter)
        .sort({ createdAt: -1 }) // Sort newest requests first
        .skip(skipCount)
        .limit(limit)
        .lean()
        .populate({
          path: "users.user groupAdmins.user deletedInfos.user initiator",
          select: "-password",
        })
        .populate({
          path: "latestMessage",
          populate: {
            path: "sender",
            select: "-password",
          },
        }),
      ChatDB.countDocuments(filter),
    ]);

    const totalPage = Math.ceil(totalChat / limit);
    if (page > totalPage && totalPage > 0)
      throw resError(
        404,
        `Page ${page} does not exist. Total pages: ${totalPage}.`
      );

    resJson(
      res,
      200,
      `${chats.length} request chats returned from page ${page} of ${totalPage}.`,
      {
        totalChat,
        totalPage,
        currentChat: chats.length,
        currentPage: page,
        chats,
      }
    );
  } catch (error) {
    next(error);
  }
}
