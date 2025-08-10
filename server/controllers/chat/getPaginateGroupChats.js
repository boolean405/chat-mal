import ChatDB from "../../models/chat.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

export default async function getPaginatedGroupChats(req, res, next) {
  try {
    const userId = req.user._id;
    const type = req.params.type; // 'all' or 'my'
    const sort = req.params.sort; // 'popular' or 'new'
    const page = parseInt(req.params.pageNum, 10);
    const keyword = req.query.keyword;

    if (isNaN(page)) throw resError(400, "Page number must be a valid number!");
    if (page <= 0) throw resError(400, "Page number must be greater than 0!");

    const limit = Number(process.env.PAGINATE_LIMIT) || 15;
    const skipCount = limit * (page - 1);

    let filter = { isGroupChat: true };

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
    let sortOrder = {};

    switch (sort) {
      case "popular":
        sortOrder = { "users.length": -1, updatedAt: -1 };
        break;

      case "new":
        // Sort by newest updated
        sortOrder = { createdAt: -1 };
        break;

      case "a-z":
        // Sort by name ascending
        sortOrder = { name: 1 };
        break;

      case "z-a":
        // Sort by name descending
        sortOrder = { name: -1 };
        break;

      case "active":
        // Sort by name descending
        sortOrder = { updatedAt: -1 };
        break;

      default:
        // Default fallback
        sortOrder = { updatedAt: -1 };
    }

    const groupChats = await ChatDB.find(filter)
      .sort(sortOrder)
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
