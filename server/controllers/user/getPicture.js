import UserDB from "../../models/user.js";
import PictureDB from "../../models/picture.js";
import resError from "../../utils/resError.js";

const getPicture = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const user = await UserDB.findById(userId);
    if (!user) throw resError(404, "User not found!");

    const picture = await PictureDB.findById(user.picture);
    if (!picture) throw resError(404, "Picture not found in user!");

    res.set("Content-Type", picture.contentType);
    res.send(picture.data);
  } catch (error) {
    error.status = error.status;
    next(error);
  }
};

export default getPicture;
