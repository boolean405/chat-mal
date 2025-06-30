import UserDB from "../../models/user.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";
import Encoder from "../../utils/encoder.js";
import clearCookie from "../../utils/clearCookie.js";

const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.userId;
    const password = req.body.password;
    const user = await UserDB.findById(userId);
    if (!user) throw resError(404, "User not found!");

    if (!Encoder.compare(password, user.password))
      throw resError(401, "Incorrect password to delete account!");

    await UserDB.findByIdAndDelete(user._id);

    clearCookie(req, res, "refreshToken");
    resJson(res, 200, "Success deleted account.");
  } catch (error) {
    error.status = error.status;
    next(error);
  }
};

export default deleteAccount;
