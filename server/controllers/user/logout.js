import UserDB from "../../models/user.js";
import resJson from "../../utils/resJson.js";
import clearCookie from "../../utils/clearCookie.js";

const signout = async (req, res, next) => {
  try {
    const decodedId = req.decodedId;
    const user = await UserDB.findById(decodedId);
    if (!user) {
      clearCookie(req, res, "refreshToken");
      return resJson(res, 204);
    }
    await UserDB.findByIdAndUpdate(user._id, {
      refreshToken: "",
    });

    clearCookie(req, res, "refreshToken");
    resJson(res, 200, "Success signout.");
  } catch (error) {
    error.status = error.status;
    next(error);
  }
};

export default signout;
