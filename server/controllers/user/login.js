import UserDB from "../../models/user.js";
import Encoder from "../../utils/encoder.js";
import resJson from "../../utils/resJson.js";
import Token from "../../utils/token.js";
import resError from "../../utils/resError.js";
import resCookie from "../../utils/resCookie.js";

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const existUser = await UserDB.findOne({ email });
    if (!existUser) throw resError(404, "User not found!");

    const correctPassword = Encoder.compare(password, existUser.password);
    if (!correctPassword) throw resError(401, "Incorrect password!");

    const refreshToken = Token.makeRefreshToken({
      id: existUser._id.toString(),
    });
    const accessToken = Token.makeAccessToken({
      id: existUser._id.toString(),
    });

    await UserDB.findByIdAndUpdate(existUser._id, {
      refreshToken,
    });

    const user = await UserDB.findById(existUser._id).select("-password");

    resCookie(req, res, "refreshToken", refreshToken);
    resJson(res, 200, "Success signin.", { user, accessToken });
  } catch (error) {
    error.status = error.status;
    next(error);
  }
};

export default login;
