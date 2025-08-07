import UserDB from "../../models/user.js";
import FollowDB from "../../models/follow.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

export async function follow(req, res, next) {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.body.userId;

    if (currentUserId.toString() === targetUserId) {
      throw resError(400, "You can't follow yourself!");
    }

    const targetUser = await UserDB.findById(targetUserId);
    if (!targetUser) throw resError(404, "Target user not found!");

    const alreadyFollowing = await FollowDB.exists({
      follower: currentUserId,
      following: targetUserId,
    });

    if (alreadyFollowing) {
      throw resError(400, "You are already following this user!");
    }

    await FollowDB.create({
      follower: currentUserId,
      following: targetUserId,
    });

    return resJson(res, 200, "User followed successfully.", { followed: true });
  } catch (error) {
    next(error);
  }
}

// Unfollow
export async function unfollow(req, res, next) {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.userId;

    if (currentUserId.toString() === targetUserId) {
      throw resError(400, "You can't unfollow yourself!");
    }

    const targetUser = await UserDB.findById(targetUserId);
    if (!targetUser) throw resError(404, "Target user not found!");

    const existingFollow = await FollowDB.findOneAndDelete({
      follower: currentUserId,
      following: targetUserId,
    });

    if (!existingFollow) {
      throw resError(400, "You are not following this user!");
    }

    return resJson(res, 200, "User unfollowed successfully.", {
      followed: false,
    });
  } catch (error) {
    next(error);
  }
}

// Check is following
export async function isFollowing(req, res, next) {
  try {
    const targetUserId = req.params.userId;

    // Run both queries in parallel
    const [targetUserExists, isFollowing] = await Promise.all([
      UserDB.exists({ _id: targetUserId }),
      FollowDB.exists({
        follower: req.user._id,
        following: targetUserId,
      }),
    ]);

    if (!targetUserExists) throw resError(404, "Target user not found!");

    return resJson(
      res,
      200,
      isFollowing ? "User is following." : "User is not following.",
      { isFollowing: !!isFollowing }
    );
  } catch (error) {
    next(error);
  }
}

export async function getPaginatedFollowUsers(req, res, next) {
  try {
    const userId = req.userId;
    const type = req.params.type;
    const page = parseInt(req.params.pageNum, 10);
    const keyword = req.query.keyword?.trim() || "";

    const safeKeyword = keyword ? escapeRegex(keyword) : "";

    if (isNaN(page) || page <= 0) {
      throw resError(400, "Page number must be a valid number > 0!");
    }

    const limit = Number(process.env.PAGINATE_LIMIT) || 15;
    const skip = (page - 1) * limit;

    let userIds = [];

    if (type === "followers") {
      userIds = await FollowDB.find({ following: userId }).distinct("follower");
    } else if (type === "following") {
      userIds = await FollowDB.find({ follower: userId }).distinct("following");
    } else if (type === "friends") {
      const [iFollow, followsMe] = await Promise.all([
        FollowDB.find({ follower: userId }).distinct("following"),
        FollowDB.find({ following: userId }).distinct("follower"),
      ]);

      userIds = iFollow.filter((id) =>
        followsMe.some((followerId) => followerId.toString() === id.toString())
      );
    } else {
      throw resError(400, "Invalid follow type.");
    }

    // Filter users by keyword
    const query = {
      _id: { $in: userIds },
      ...(safeKeyword && {
        $or: [
          { username: { $regex: safeKeyword, $options: "i" } },
          { name: { $regex: safeKeyword, $options: "i" } },
        ],
      }),
    };

    const totalCount = await UserDB.countDocuments(query);
    const users = await UserDB.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 })
      .select("-password")
      .lean();

    const totalPage = Math.ceil(totalCount / limit);

    return resJson(
      res,
      200,
      `Returned ${users.length} ${type} from page ${page}.`,
      {
        users,
        currentPage: page,
        totalPage,
        totalCount,
      }
    );
  } catch (error) {
    next(error);
  }
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
