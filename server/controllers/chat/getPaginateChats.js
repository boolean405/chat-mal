import UserDB from "../../models/user.js";
import ChatDB from "../../models/chat.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

export default async function getPaginateChats(req, res, next) {
  try {
    const userId = req.userId;
    const page = parseInt(req.params.pageNum);
    const limit = Number(process.env.PAGINATE_LIMIT) || 15;
    const skipCount = limit * (page - 1);

    const user = await UserDB.findById(userId);
    if (!user) throw resError(401, "Authenticated user not found!");

    if (isNaN(page)) throw resError(400, "Page number must be a valid number!");

    if (page <= 0) throw resError(400, "Page number must be greater than 0!");

    // Step 1: Base match
    const baseMatch = {
      "users.user": user._id,
      $or: [{ isPending: false }, { initiator: user._id }],
    };

    const basePipeline = [
      { $match: baseMatch },

      // Lookup latestMessage
      {
        $lookup: {
          from: "messages",
          localField: "latestMessage",
          foreignField: "_id",
          as: "latestMessage",
        },
      },
      { $unwind: { path: "$latestMessage", preserveNullAndEmptyArrays: true } },

      // Lookup sender inside latestMessage
      {
        $lookup: {
          from: "users",
          localField: "latestMessage.sender",
          foreignField: "_id",
          as: "latestMessage.sender",
        },
      },
      {
        $unwind: {
          path: "$latestMessage.sender",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          "latestMessage.sender.password": 0,
        },
      },

      // Filter deletedInfos for this user
      {
        $addFields: {
          deletedInfoForUser: {
            $first: {
              $filter: {
                input: "$deletedInfos",
                as: "info",
                cond: { $eq: ["$$info.user", user._id] },
              },
            },
          },
        },
      },

      // Filter chats by deletedInfo date
      {
        $match: {
          $or: [
            { deletedInfoForUser: { $exists: false } },
            { deletedInfoForUser: null },
            {
              $expr: {
                $and: [
                  { $ifNull: ["$latestMessage.createdAt", false] },
                  { $ifNull: ["$deletedInfoForUser.deletedAt", false] },
                  {
                    $gt: [
                      "$latestMessage.createdAt",
                      "$deletedInfoForUser.deletedAt",
                    ],
                  },
                ],
              },
            },
          ],
        },
      },

      // Populate users.user
      {
        $lookup: {
          from: "users",
          localField: "users.user",
          foreignField: "_id",
          as: "populatedUsers",
        },
      },
      {
        $addFields: {
          users: {
            $map: {
              input: "$users",
              as: "userItem",
              in: {
                $mergeObjects: [
                  "$$userItem",
                  {
                    user: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$populatedUsers",
                            as: "u",
                            cond: { $eq: ["$$u._id", "$$userItem.user"] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },

      // Populate groupAdmins.user
      {
        $lookup: {
          from: "users",
          localField: "groupAdmins.user",
          foreignField: "_id",
          as: "populatedAdmins",
        },
      },
      {
        $addFields: {
          groupAdmins: {
            $map: {
              input: "$groupAdmins",
              as: "adminItem",
              in: {
                $mergeObjects: [
                  "$$adminItem",
                  {
                    user: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$populatedAdmins",
                            as: "a",
                            cond: { $eq: ["$$a._id", "$$adminItem.user"] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },

      // Populate unreadInfos.user
      {
        $lookup: {
          from: "users",
          localField: "unreadInfos.user",
          foreignField: "_id",
          as: "populatedUnreadUsers",
        },
      },
      {
        $addFields: {
          unreadInfos: {
            $map: {
              input: "$unreadInfos",
              as: "unreadItem",
              in: {
                $mergeObjects: [
                  "$$unreadItem",
                  {
                    user: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$populatedUnreadUsers",
                            as: "u",
                            cond: { $eq: ["$$u._id", "$$unreadItem.user"] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },

      // Populate initiator
      {
        $lookup: {
          from: "users",
          localField: "initiator",
          foreignField: "_id",
          as: "initiator",
        },
      },
      {
        $unwind: { path: "$initiator", preserveNullAndEmptyArrays: true },
      },
      {
        $unset: ["populatedUsers", "populatedAdmins", "populatedUnreadUsers"],
      },

      // Exclude passwords from all user fields
      {
        $project: {
          "users.user.password": 0,
          "users.user.refreshToken": 0,
          "groupAdmins.user.password": 0,
          "groupAdmins.user.refreshToken": 0,
          "initiator.password": 0,
          "initiator.refreshToken": 0,
          "latestMessage.sender.password": 0,
          "latestMessage.sender.refreshToken": 0,
          "deletedInfoForUser.user.password": 0,
          "deletedInfoForUser.user.refreshToken": 0,
          "unreadInfos.user.password": 0,
          "unreadInfos.user.refreshToken": 0,
        },
      },
      { $sort: { updatedAt: -1 } },
      { $skip: skipCount },
      { $limit: limit },
    ];

    // Count pipeline (reuse filtering stages before pagination)
    const countPipeline = [
      { $match: baseMatch },
      ...basePipeline
        .slice(1)
        .filter((stage) => !stage.$skip && !stage.$limit && !stage.$sort),
      { $count: "totalCount" },
    ];

    const [chats, countResult] = await Promise.all([
      ChatDB.aggregate(basePipeline),
      ChatDB.aggregate(countPipeline),
    ]);

    const totalCount = countResult[0]?.totalCount || 0;
    const totalPage = Math.ceil(totalCount / limit);

    resJson(
      res,
      200,
      `${chats.length} chats returned from page ${page} of ${totalPage}.`,
      {
        totalCount,
        totalPage,
        currentCount: chats.length,
        currentPage: page,
        chats,
      }
    );
  } catch (error) {
    next(error);
  }
}
// import UserDB from "../../models/user.js";
// import ChatDB from "../../models/chat.js";
// import resJson from "../../utils/resJson.js";
// import resError from "../../utils/resError.js";

// export default async function getPaginateChats(req, res, next) {
//   try {
//     const userId = req.userId;
//     const page = parseInt(req.params.pageNum);

//     if (!(await UserDB.exists({ _id: userId })))
//       throw resError(401, "Authenticated user not found!");

//     if (isNaN(page)) throw resError(400, "Page number must be a valid number!");

//     if (page <= 0) throw resError(400, "Page number must be greater than 0!");

//     const limit = Number(process.env.PAGINATE_LIMIT) || 15;
//     const skipCount = limit * (page - 1);

//     const filter = {
//       "users.user": userId,
//       $or: [
//         { isPending: false },
//         { initiator: userId }, // show pending requests only if user initiated
//       ],
//       // latestMessage: { $ne: null },
//     };

//     const [chats, totalCount] = await Promise.all([
//       ChatDB.find(filter)
//         .sort({ updatedAt: -1 })
//         .skip(skipCount)
//         .limit(limit)
//         .lean()
//         .populate({
//           path: "users.user groupAdmins.user deletedInfos.user initiator",
//           select: "-password",
//         })
//         .populate({
//           path: "latestMessage",
//           populate: {
//             path: "sender",
//             select: "-password",
//           },
//         }),
//       ChatDB.countDocuments(filter),
//     ]);

//     // Filter out chats deleted by user where no new message has arrived
//     const filteredChats = chats.filter((chat) => {
//       const deletedInfo = chat.deletedInfos?.find(
//         (entry) => entry.user._id.toString() === userId.toString()
//       );
//       if (!deletedInfo) return true;
//       if (!chat.latestMessage) return false;
//       return (
//         new Date(chat.latestMessage.createdAt) > new Date(deletedInfo.deletedAt)
//       );
//     });

//     const totalPage = Math.ceil(totalCount / limit);

//     resJson(
//       res,
//       200,
//       `${filteredChats.length} chats returned from page ${page} of ${totalPage}.`,
//       {
//         totalCount,
//         totalPage,
//         currentCount: filteredChats.length,
//         currentPage: page,
//         chats: filteredChats,
//       }
//     );
//   } catch (error) {
//     next(error);
//   }
// }
