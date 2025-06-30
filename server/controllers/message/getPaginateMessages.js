import UserDB from "../../models/user.js";
import ChatDB from "../../models/chat.js";
import MessageDB from "../../models/message.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

export default async function getPaginateMessages(req, res, next) {
  try {
    const userId = req.userId;
    const chatId = req.params.chatId;
    const page = parseInt(req.params.pageNum);

    const [userExists, dbChat] = await Promise.all([
      UserDB.exists({ _id: userId }),
      ChatDB.findById(chatId),
    ]);

    if (!userExists) throw resError(401, "Authenticated user not found!");
    if (!dbChat) throw resError(404, "Chat not found!");

    if (isNaN(page)) throw resError(400, "Page number must be a valid number!");

    if (page <= 0) throw resError(400, "Page number must be greater than 0!");

    const limit = Number(process.env.PAGINATE_LIMIT) || 15;
    const skipCount = limit * (page - 1);

    const [messages, totalCount] = await Promise.all([
      MessageDB.find({ chat: chatId })
        .sort({ createdAt: -1 })
        .skip(skipCount)
        .limit(limit)
        .lean()
        .populate({
          path: "sender chat",
          select: "-password",
        }),
      MessageDB.countDocuments({ chat: chatId }),
    ]);

    const totalPage = Math.ceil(totalCount / limit);
    if (page > totalPage && totalPage > 0)
      throw resError(
        404,
        `Page ${page} does not exist. Total pages: ${totalPage}!`
      );

    resJson(
      res,
      200,
      `${messages.length} messages returned from page ${page} of ${totalPage}.`,
      {
        totalCount,
        totalPage,
        currentCount: messages.length,
        currentPage: page,
        messages,
      }
    );
  } catch (error) {
    next(error);
  }
}
