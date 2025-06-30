import UserDB from "../../models/user.js";
import Encoder from "../../utils/encoder.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

const changePassword = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { oldPassword, newPassword } = req.body;
    const user = await UserDB.findById(userId);
    if (!user) throw resError(404, "User not found!");

    if (!Encoder.compare(oldPassword, user.password))
      throw resError(401, "Incorrect old password!");

    // Password Encryption
    const newHashedPassword = Encoder.encode(newPassword);
    await UserDB.findByIdAndUpdate(user._id, {
      password: newHashedPassword,
    });

    const updatedUser = await UserDB.findById(user._id).select("-password");

    resJson(res, 200, "Success changed password.", updatedUser);
  } catch (error) {
    error.status = error.status;
    next(error);
  }
};

export default changePassword;
