import UserDB from "../../models/user.js";
import resJson from "../../utils/resJson.js";
import clearCookie from "../../utils/clearCookie.js";

export default async function logout(req, res, next) {
  try {
    const userId = req.decodedId;
    const user = await UserDB.findById(userId);
    if (!user) {
      clearCookie(req, res, "refreshToken");
      return resJson(res, 204, "User not found, session cleared.");
    }

    // 2. Clear the refreshToken in DB (if applicable)
    if (user.refreshToken) {
      user.refreshToken = undefined; // or = ""
      await user.save();
    }

    clearCookie(req, res, "refreshToken");
    resJson(res, 200, "Success logout.");
  } catch (error) {
    next(error);
  }
}
