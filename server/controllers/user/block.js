import BlockDB from "../../models/block.js";
import UserDB from "../../models/user.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

export async function block(req, res, next) {
  try {
    const blockerId = req.user._id;
    const blockedId = req.body.userId;

    if (blockerId.toString() === blockedId) {
      throw resError(400, "You can't block yourself.");
    }

    const targetUser = await UserDB.findById(blockedId);
    if (!targetUser) throw resError(404, "User not found.");

    const existingBlock = await BlockDB.findOne({
      blocker: blockerId,
      blocked: blockedId,
    });

    if (existingBlock) {
      return resJson(res, 200, "User already blocked.");
    }

    await BlockDB.create({ blocker: blockerId, blocked: blockedId });

    // Optional cleanup: remove follow
    await Promise.all([
      // delete both directions
      BlockDB.deleteMany({ follower: blockerId, following: blockedId }),
      BlockDB.deleteMany({ follower: blockedId, following: blockerId }),
    ]);

    return resJson(res, 200, "User blocked successfully.", { blocked: true });
  } catch (error) {
    next(error);
  }
}

export async function unblock(req, res, next) {
  try {
    const blockerId = req.user._id;
    const blockedId = req.params.userId;

    const deleted = await BlockDB.findOneAndDelete({
      blocker: blockerId,
      blocked: blockedId,
    });

    if (!deleted) {
      throw resError(404, "User is not blocked.");
    }

    return resJson(res, 200, "User unblocked successfully.");
  } catch (error) {
    next(error);
  }
}

export async function isBlocked(req, res, next) {
  try {
    const blockerId = req.user._id;
    const blockedId = req.params.userId;

    const exists = await BlockDB.exists({
      blocker: blockerId,
      blocked: blockedId,
    });

    return resJson(res, 200, "Block status retrieved", {
      isBlocked: !!exists,
    });
  } catch (error) {
    next(error);
  }
}
