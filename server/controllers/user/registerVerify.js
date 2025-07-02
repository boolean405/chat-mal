import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import Token from "../../utils/token.js";
import UserDB from "../../models/user.js";
import VerifyDB from "../../models/verify.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";
import sendEmail from "../../utils/sendEmail.js";
import resCookie from "../../utils/resCookie.js";
import UserPrivacyDB from "../../models/userPrivacy.js";
import { APP_NAME } from "../../constants/index.js";

export default async function registerVerify(req, res, next) {
  try {
    const { email, code } = req.body;
    if (!(await VerifyDB.findOne({ email })))
      throw resError(400, "Invalid email!");

    const record = await VerifyDB.findOne({ code });
    if (!record) throw resError(400, "Invalid verification code!");

    if (record.expiresAt < new Date())
      throw resError(410, "Expired verification code!");

    const newUser = await UserDB.create({
      name: record.name,
      username: record.username,
      email: record.email,
      password: record.password,
    });
    if (newUser) await UserPrivacyDB.create({ user: newUser._id });

    const refreshToken = Token.makeRefreshToken({
      id: newUser._id.toString(),
    });
    const accessToken = Token.makeAccessToken({
      id: newUser._id.toString(),
    });

    // Update and get user in one step
    const user = await UserDB.findByIdAndUpdate(
      newUser._id,
      { refreshToken },
      { new: true, select: "-password" }
    );

    await VerifyDB.findByIdAndDelete(record._id);
    // Send verified email
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    let htmlFile = fs.readFileSync(
      path.join(__dirname, "../../assets/html/successSignup.html"),
      "utf8"
    );

    await sendEmail(
      user.email,
      `[${APP_NAME}] Successfully Verified`,
      htmlFile
    );

    resCookie(req, res, "refreshToken", refreshToken);
    resJson(res, 201, "Success register.", { user, accessToken });
  } catch (error) {
    next(error);
  }
}
