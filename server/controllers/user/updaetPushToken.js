import UserDB from "../../models/user.js";
import resJson from "../../utils/resJson.js";

export default async function updatePushToken(req, res, next) {
  try {
    const user = req.user;
    const pushToken = req.body.pushToken;

    await UserDB.findByIdAndUpdate(user._id, { pushToken });

    return resJson(res, 200, "Success updated push token.");
  } catch (error) {
    next(error);
  }
}
