import UserDB from "../../models/user.js";
import resJson from "../../utils/resJson.js";
import clearCookie from "../../utils/clearCookie.js";

export default async function logout(req, res, next) {
  try {
    const userId = req.decodedId;
    const user = req.user;

    const updatedUser = await UserDB.findByIdAndUpdate(
      userId || user._id,
      { $unset: { refreshToken: "" } },
      { $unset: { pushToken: "" } },
      { new: true }
    );
    clearCookie(req, res, "refreshToken");

    if (!updatedUser) return res.status(204).end();

    return resJson(res, 200, "Successfully logged out.");
  } catch (error) {
    next(error);
  }
}
