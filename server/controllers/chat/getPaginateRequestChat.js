import UserDB from "../../models/user.js";
import ChatDB from "../../models/chat.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

export default async function getPaginateRequestChat(req, res, next) {
  try {
    const user = req.user;
    const page = parseInt(req.params.pageNum);

    if (!(await UserDB.exists({ _id: user._id })))
      throw resError(401, "Authenticated user not found!");

    if (isNaN(page)) throw resError(400, "Page number must be a valid number!");

    if (page <= 0) throw resError(400, "Page number must be greater than 0!");

    const limit = Number(process.env.PAGINATE_LIMIT) || 15;
    const skipCount = limit * (page - 1);

    const filter = {
      isPending: true,
      "users.user": user._id,
      initiator: { $ne: user._id },
      $or: [
        { deletedInfos: { $size: 0 } }, // No one deleted the chat
        {
          $expr: {
            $not: {
              $in: [
                user._id,
                {
                  $map: {
                    input: {
                      $filter: {
                        input: "$deletedInfos",
                        as: "info",
                        cond: {
                          $and: [
                            { $eq: ["$$info.user", user._id] },
                            {
                              $gte: [
                                "$$info.deletedAt",
                                {
                                  $ifNull: [
                                    "$latestMessage.createdAt",
                                    new Date(0),
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      },
                    },
                    as: "info",
                    in: "$$info.user",
                  },
                },
              ],
            },
          },
        },
      ],
    };

    const [chats, totalChat] = await Promise.all([
      ChatDB.find(filter)
        .sort({ createdAt: -1 }) // Sort newest requests first
        .skip(skipCount)
        .limit(limit)
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
        })
        .lean(),
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
