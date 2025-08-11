import UserDB from "../../models/user.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

const changeName = async (req, res, next) => {
  try {
    const userId = req.userId;
    const name = req.body.name;
    const user = await UserDB.findById(userId);
    if (!user) {
      throw resError(401, "Authenticated user not found!");
    }

    await UserDB.findByIdAndUpdate(user._id, {
      name,
    });

    const updatedUser = await UserDB.findById(user._id).select("-password");

    resJson(res, 200, "Success changed name.", updatedUser);
  } catch (error) {
    next(error);
  }
};

export default changeName;
