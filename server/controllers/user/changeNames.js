import UserDB from "../../models/user.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

const changeNames = async (req, res, next) => {
  try {
    const userId = req.userId;
    const body = req.body;
    if (!body) throw resError(400, "Need to edit something!");

    const currentUser = await UserDB.findById(userId);
    if (!currentUser) throw resError(404, "User not found!");

    const name = body.name;
    const username = body.username;

    if (username && username !== currentUser.username)
      if (await UserDB.findOne({ username }))
        throw resError(409, "Username already exist!");

    const editedUser = {};

    // update currentUser
    if (name) editedUser.name = name;
    if (username) editedUser.username = username;

    await UserDB.findByIdAndUpdate(currentUser._id, editedUser);

    const user = await UserDB.findById(currentUser._id).select("-password");

    resJson(res, 200, "Success edited profile", { user });
  } catch (error) {
    next(error);
  }
};

export default changeNames;
