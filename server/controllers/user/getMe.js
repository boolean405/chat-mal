import UserDB from "../../models/user.js";
import resJson from "../../utils/resJson.js";

export default async function getMe(req, res, next) {
  try {
    const user = req.user;
    console.log(user);
    

    resJson(res, 200, "Success get user details.", { user });
  } catch (error) {
    next(error);
  }
}
