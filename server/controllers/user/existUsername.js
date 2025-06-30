import UserDB from "../../models/user.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

const existUsername = async (req, res, next) => {
  try {
    const username = req.query.username;
    const user = await UserDB.findOne({ username }).select("-password");
    if (!user) throw resError(200, "Username not found!");

    resJson(res, 200, "Success exist username.", user);
  } catch (error) {
    error.status = error.status;
    next(error);
  }
};

export default existUsername;
