import resJson from "../../utils/resJson.js";
import CallDB from "../../models/call.js";

export default async function getCallLog(req, res, next) {
  try {
    const userId = req.user._id;

    const logs = await CallDB.find({
      $or: [{ caller: userId }, { receiver: userId }],
    })
      .populate("caller", "name profilePhoto")
      .sort({ createdAt: -1 });

    return resJson(res, 200, "Success get call log.", logs);
  } catch (error) {
    next(error);
  }
}
