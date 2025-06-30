import UserDB from "../../models/user.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

const getUser = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await UserDB.findById(userId).select("-password");
    if (!user) throw resError(404, "User not found!");

    resJson(res, 200, "Success get user details.", user);
  } catch (error) {
    error.status = error.status;
    next(error);
  }
};

export default getUser;


