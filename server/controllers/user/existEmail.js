import UserDB from "../../models/user.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

const existEmail = async (req, res, next) => {
  try {
    const email = req.query.email;
    const user = await UserDB.findOne({ email }).select("-password");
    if (!user) throw resError(200, "Email not found!");

    resJson(res, 200, "Success exist email.", user);
  } catch (error) {
    error.status = error.status;
    next(error);
  }
};

export default existEmail;
