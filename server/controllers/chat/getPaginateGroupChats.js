import ChatDB from "../../models/chat.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

export default async function getPaginatedGroupChats(req, res, next) {
  try {
    const userId = req.user._id;
    const keyword = req.query.keyword;
    const { type, sort, pageNum } = req.params;
    const page = parseInt(pageNum, 10);

    if (isNaN(page)) {throw resError(400, "Page number must be a valid number!");}
    if (page <= 0) {throw resError(400, "Page number must be greater than 0!");}

    const limit = Number(process.env.PAGINATE_LIMIT) || 15;
    const skipCount = limit * (page - 1);

    const filter = { isGroupChat: true };

    if (keyword && keyword.trim() !== "") {
      filter.name = { $regex: keyword.trim(), $options: "i" };
    }

    // Filter
    if (type === "my") {
      filter["users.user"] = userId;
    } else if (type === "all") {
      filter["users.user"] = { $ne: userId };
    } else if (type === "recommend") {
      filter["users.user"] = { $ne: userId };
    }

    // Set sort order based on the 'sort' param

    // sort mapping
    const sortMap = {
      "a-z": { name: 1 },
      "z-a": { name: -1 },
      new: { createdAt: -1 },
      active: { updatedAt: -1 },
      popular: { "users.length": -1, updatedAt: -1 },
    };
    const sortObj = sortMap[sort] || sortMap.active;

    const groupChats = await ChatDB.find(filter)
      .sort(sortObj)
      .skip(skipCount)
      .limit(limit)
      .populate("latestMessage")
      .lean();

    const totalCount = await ChatDB.countDocuments(filter);
    const totalPage = Math.ceil(totalCount / limit);

    resJson(
      res,
      200,
      `${groupChats.length} group chats returned from page ${page} of ${totalPage}.`,
      {
        totalCount,
        totalPage,
        currentCount: groupChats.length,
        currentPage: page,
        groupChats,
      }
    );
  } catch (error) {
    next(error);
  }
}
