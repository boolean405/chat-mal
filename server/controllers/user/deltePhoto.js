import Token from "../../utils/token.js";
import UserDB from "../../models/user.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";
import deletImage from "../../utils/deleteImage.js";

export default async function deletePhoto(req, res, next) {
  try {
    const userId = req.userId;
    const body = req.body;
    if (!body) throw resError(400, "Photo is required to delete!");

    const coverPhoto = body.coverPhoto;
    const profilePhoto = body.profilePhoto;

    const user = await UserDB.findById(userId);
    if (!user) throw resError(404, "User not found!");

    const editedPhoto = {};

    if (profilePhoto && profilePhoto === user.profilePhoto) {
      const response = await deletImage(user, "profilePhoto");
      if (response) editedPhoto.profilePhoto = "";
    }

    if (coverPhoto && coverPhoto === user.coverPhoto) {
      const response = await deletImage(user, "coverPhoto");
      if (response) editedPhoto.coverPhoto = "";
    }

    await UserDB.findByIdAndUpdate(user._id, editedPhoto);
    const updatedUser = await UserDB.findById(user._id).select("-password");

    const accessToken = Token.makeAccessToken({
      id: updatedUser._id.toString(),
    });
    resJson(res, 200, "Success deleted photo.", {
      user: updatedUser,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
}
