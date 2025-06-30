import Token from "../../utils/token.js";
import UserDB from "../../models/user.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";
import uploadUserPhoto from "../../utils/uploadUserPhoto.js";

export default async function uploadPhoto(req, res, next) {
  try {
    const userId = req.userId;
    const body = req.body;
    if (!body) throw resError(400, "Photo is required to upload!");

    const coverPhoto = body.coverPhoto;
    const profilePhoto = body.profilePhoto;

    const user = await UserDB.findById(userId);
    if (!user) throw resError(401, "Authenticated user not found!");

    const editedPhoto = {};

    if (profilePhoto) {
      editedPhoto.profilePhoto = await uploadUserPhoto(
        user,
        "profilePhoto",
        profilePhoto,
        "chat-mal/users/profile-photo"
      );
    }
    if (coverPhoto) {
      editedPhoto.coverPhoto = await uploadUserPhoto(
        user,
        "coverPhoto",
        coverPhoto,
        "chat-mal/users/cover-photo"
      );
    }

    await UserDB.findByIdAndUpdate(user._id, editedPhoto);
    const updatedUser = await UserDB.findById(user._id).select("-password");

    const accessToken = Token.makeAccessToken({
      id: updatedUser._id.toString(),
    });
    const userWithToken = updatedUser.toObject();
    userWithToken.accessToken = accessToken;

    resJson(res, 200, "Success uupload photo.", userWithToken);
  } catch (error) {
    next(error);
  }
}

// import Token from "../../utils/token.js";
// import UserDB from "../../models/user.js";
// import resJson from "../../utils/resJson.js";
// import resError from "../../utils/resError.js";
// import uploadImage from "../../utils/uploadImage.js";

// const uploadPhoto = async (req, res, next) => {
//   try {
//     const userId = req.userId;

//     const files = req.files;
//     if (!files) throw resError(400, "Photo is required to upload!");

//     const coverPhoto = files.coverPhoto;
//     const profilePhoto = files.profilePhoto;

//     const user = await UserDB.findById(userId);
//     if (!user) throw resError(404, "User not found!");

//     const editedPhoto = {};

//     if (profilePhoto) {
//       editedPhoto.profilePhoto = await uploadImage(
//         user,
//         profilePhoto,
//         "kkhay/users/profilephoto"
//       );
//     }
//     if (coverPhoto) {
//       editedPhoto.coverPhoto = await uploadImage(
//         user,
//         coverPhoto,
//         "kkhay/users/coverphoto"
//       );
//     }

//     await UserDB.findByIdAndUpdate(user._id, editedPhoto);
//     const updatedUser = await UserDB.findById(user._id).select("-password");
//     const accessToken = Token.makeAccessToken({
//       id: updatedUser._id.toString(),
//     });
//     resJson(res, 200, "Success upload photo", {
//       user: updatedUser,
//       accessToken,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export default uploadPhoto;
