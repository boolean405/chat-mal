import UserDB from "../../models/user.js";
import resJson from "../../utils/resJson.js";

const existUsername = async (req, res, next) => {
  try {
    const username = req.query.username;
    const user = await UserDB.exists({ username });
    console.log(user);

    if (!user)
      return res
        .status(200)
        .json({ status: false, message: "Username don't exist!" });

    resJson(res, 200, "Success exist username.");
  } catch (error) {
    next(error);
  }
};

export default existUsername;
