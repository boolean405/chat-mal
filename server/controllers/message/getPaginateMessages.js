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

    if (isNaN(page)) throw resError(400, "Page number must be a valid number!");
    if (page <= 0) throw resError(400, "Page number must be greater than 0!");

    const limit = Number(process.env.PAGINATE_LIMIT) || 15;
    const skipCount = limit * (page - 1);

    const [userExists, dbChat] = await Promise.all([
      UserDB.exists({ _id: userId }),
      ChatDB.findById(chatId).lean(),
    ]);

    if (!userExists) throw resError(401, "Authenticated user not found!");
    if (!dbChat) throw resError(404, "Chat not found!");

    // Find deletedAt for this user in this chat
    const deletedEntry = dbChat.deletedInfos?.find(
      (info) => info.user.toString() === userId.toString()
    );
    const deletedAt = deletedEntry?.deletedAt || null;

    // Build filter for messages
    const messageFilter = {
      chat: chatId,
      ...(deletedAt && { createdAt: { $gt: deletedAt } }),
    };

    // Fetch messages & count simultaneously
    const [messages, totalCount] = await Promise.all([
      MessageDB.find(messageFilter)
        .sort({ createdAt: -1 }) // Most recent messages first
        .skip(skipCount)
        .limit(limit)
        .lean()
        .populate([
          {
            path: "sender",
            select: "-password",
          },
          {
            path: "chat",
            populate: [
              {
                path: "users.user groupAdmins.user deletedInfos.user initiator unreadInfos.user latestMessage.sender",
                select: "-password",
              },
            ],
          },
        ]),
      MessageDB.countDocuments(messageFilter),
    ]);

    const totalPage = Math.ceil(totalCount / limit);

    return resJson(
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

// import UserDB from "../../models/user.js";
// import ChatDB from "../../models/chat.js";
// import MessageDB from "../../models/message.js";
// import resJson from "../../utils/resJson.js";
// import resError from "../../utils/resError.js";

// export default async function getPaginateMessages(req, res, next) {
//   try {
//     const userId = req.userId;
//     const chatId = req.params.chatId;
//     const page = parseInt(req.params.pageNum);

//     const [userExists, dbChat] = await Promise.all([
//       UserDB.exists({ _id: userId }),
//       ChatDB.findById(chatId),
//     ]);

//     if (!userExists) throw resError(401, "Authenticated user not found!");
//     if (!dbChat) throw resError(404, "Chat not found!");

//     if (isNaN(page)) throw resError(400, "Page number must be a valid number!");

//     if (page <= 0) throw resError(400, "Page number must be greater than 0!");

//     const limit = Number(process.env.PAGINATE_LIMIT) || 15;
//     const skipCount = limit * (page - 1);

//     // Find deletedAt for this user in this chat
//     let deletedAt = null;
//     if (dbChat.deletedInfos && dbChat.deletedInfos.length > 0) {
//       const info = dbChat.deletedInfos.find(
//         (i) => i.user.toString() === userId.toString()
//       );
//       if (info) deletedAt = info.deletedAt;
//     }

//     // Only fetch messages after deletedAt if exists
//     let messageFilter = { chat: chatId };
//     if (deletedAt) {
//       messageFilter.createdAt = { $gt: deletedAt };
//     }

//     const [messages, totalCount] = await Promise.all([
//       MessageDB.find(messageFilter)
//         .sort({ updatedAt: -1 })
//         .skip(skipCount)
//         .limit(limit)
//         .lean()
//         .populate({
//           path: "sender chat",
//           select: "-password",
//         }),
//       MessageDB.countDocuments({ chat: chatId }),
//     ]);

//     const totalPage = Math.ceil(totalCount / limit);
//     // if (page > totalPage && totalPage > 0)
//     //   throw resError(
//     //     404,
//     //     `Page ${page} does not exist. Total pages: ${totalPage}!`
//     //   );

//     return resJson(
//       res,
//       200,
//       `${messages.length} messages returned from page ${page} of ${totalPage}.`,
//       {
//         totalCount,
//         totalPage,
//         currentCount: messages.length,
//         currentPage: page,
//         messages,
//       }
//     );
//   } catch (error) {
//     next(error);
//   }
// }
