import UserDB from "../../models/user.js";
import resError from "../../utils/resError.js";
import resJson from "../../utils/resJson.js";

export default async function getPaginatedUsers(req, res, next) {
  try {
    const userId = req.userId;
    const keyword = req.query.keyword.trim() || "";
    const gender = req.query.gender;
    const page = parseInt(req.params.pageNum, 10);

    if (!(await UserDB.exists({ _id: userId })))
      throw resError(401, "Authenticated user not found!");

    if (isNaN(page)) throw resError(400, "Page number must be a valid number!");

    if (page <= 0) throw resError(400, "Page number must be greater than 0!");

    const limit = Number(process.env.PAGINATE_LIMIT) || 15;
    const skipCount = limit * (page - 1);

    const keywordSearch = keyword
      ? {
          $or: [
            { name: { $regex: keyword, $options: "i" } },
            { username: { $regex: keyword, $options: "i" } },
            { email: { $regex: keyword, $options: "i" } },
          ],
        }
      : {};

    let filter = {
      ...keywordSearch,
      _id: { $ne: userId },
    };

    // Gender filter logic
    if (gender && ["male", "female"].includes(gender.toLowerCase())) {
      filter.$or = [
        { gender: { $exists: false } },
        { gender: gender.toLowerCase() },
      ];
    }

    const users = await UserDB.find(filter)
      .sort({ createdAt: -1 })
      .skip(skipCount)
      .limit(limit)
      .select("-password")
      .lean();

    const totalCount = await UserDB.countDocuments(filter);
    const totalPage = Math.ceil(totalCount / limit);
    resJson(
      res,
      200,
      `${users.length} users returned from page ${page} of ${totalPage}.`,
      {
        totalCount,
        totalPage,
        currentCount: users.length,
        currentPage: page,
        users,
      }
    );
  } catch (error) {
    next(error);
  }
}
