import UserDB from "../../models/user.js";
import resJson from "../../utils/resJson.js";
import Token from "../../utils/token.js";
import resError from "../../utils/resError.js";
import resCookie from "../../utils/resCookie.js";

const refresh = async (req, res, next) => {
  try {
    const decodedId = req.decodedId;
    const user = await UserDB.findById(decodedId);
    if (!user) throw resError(404, "User not found!");

    const accessToken = Token.makeAccessToken({
      id: user._id.toString(),
    });
    const refreshToken = Token.makeRefreshToken({
      id: user._id.toString(),
    });

    await UserDB.findByIdAndUpdate(user._id, { refreshToken });
    const updatedUser = await UserDB.findById(user._id).select("-password");

    resCookie(req, res, "refreshToken", refreshToken);
    resJson(res, 200, "Success refresh.", { user: updatedUser, accessToken });
  } catch (error) {
    error.status = error.status;
    next(error);
  }
};

export default refresh;
