import UserDB from "../../models/user.js";
import resJson from "../../utils/resJson.js";
import Token from "../../utils/token.js";
import resError from "../../utils/resError.js";
import resCookie from "../../utils/resCookie.js";

export default async function refresh(req, res, next) {
  try {
    const userId = req.decodedId;
    const user = await UserDB.exists({ _id: userId });
    if (!user) {
      throw resError(401, "Authenticated user not found!");
    }

    const accessToken = Token.makeAccessToken({
      id: userId,
    });
    const refreshToken = Token.makeRefreshToken({
      id: userId,
    });

    const updatedUser = await UserDB.findByIdAndUpdate(
      user._id,
      { refreshToken },
      { new: true, select: "-password" }
    );

    resCookie(req, res, "refreshToken", refreshToken);
    resJson(res, 200, "Success refresh.", { user: updatedUser, accessToken });
  } catch (error) {
    next(error);
  }
}
