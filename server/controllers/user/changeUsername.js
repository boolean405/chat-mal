import UserDB from "../../models/user.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

const changeUsername = async (req, res, next) => {
  try {
    const userId = req.userId;
    const username = req.body.username;
    const user = await UserDB.findById(userId);
    if (!user) throw resError(404, "User not found!");

    if (await UserDB.findOne({ username }))
      throw resError(409, "Username already exist!");

    await UserDB.findByIdAndUpdate(user._id, {
      username,
    });

    const updatedUser = await UserDB.findById(user._id).select("-password");

    resJson(res, 200, "Success changed username.", updatedUser);
  } catch (error) {
    error.status = error.status;
    next(error);
  }
};

export default changeUsername;
