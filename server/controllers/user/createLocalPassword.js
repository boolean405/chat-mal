import UserDB from "../../models/user.js";
import Encoder from "../../utils/encoder.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

export const createLocalPassword = async (req, res, next) => {
  try {
    const user = req.user;
    const { newPassword } = req.body;

    const hasLocal = user.authProviders?.some((p) => p.provider === "local");

    if (hasLocal) throw resError(400, "Local password already exists!");

    // Password Encryption
    const newHashedPassword = Encoder.encode(newPassword);
    const updatedUser = await UserDB.findByIdAndUpdate(
      user._id,
      {
        password: newHashedPassword,
        $addToSet: {
          authProviders: {
            provider: "local",
            providerId: user._id,
          },
        },
      },
      { new: true }
    ).select("-password");

    return resJson(res, 200, "Success create a new password.", {
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
