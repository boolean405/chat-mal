import UserDB from "../../models/user.js";
import resJson from "../../utils/resJson.js";

const existEmail = async (req, res, next) => {
  try {
    const email = req.query.email;
    const user = await UserDB.exists({ email });
    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: "Eamil don't exist!" });
    }

    resJson(res, 200, "Success email exist.");
  } catch (error) {
    next(error);
  }
};

export default existEmail;
