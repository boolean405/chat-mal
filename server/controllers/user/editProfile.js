import UserDB from "../../models/user.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

export const editProfile = async (req, res, next) => {
  try {
    const currentUser = req.user;

    const body = req.body;
    if (!body) throw resError(400, "Need to edit something!");

    const name = body.name;
    const username = body.username;
    const birthday = body.birthday;
    const gender = body.gender;

    if (username && username === currentUser.username) {
      throw resError(400, "Choose another username!");
    }

    if (username && (await UserDB.exists({ username }))) {
      throw resError(409, "Username already exist!");
    }

    // update currentUser
    const payload = {};
    if (name) payload.name = name;
    if (username) payload.username = username;
    if (gender) payload.gender = gender;
    if (birthday) payload.birthday = birthday;
    else payload.birthday = null;

    const user = await UserDB.findByIdAndUpdate(currentUser._id, payload, {
      new: true,
    })
      .select("-password")
      .lean();

    return resJson(res, 200, "Success edited profile", { user });
  } catch (error) {
    next(error);
  }
};
