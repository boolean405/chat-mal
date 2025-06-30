import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import UserDB from "../../models/user.js";
import Encoder from "../../utils/encoder.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";
import sendEmail from "../../utils/sendEmail.js";
import VerifyDB from "../../models/verify.js";
import { APP_NAME } from "../../constants/index.js";

const register = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;
    // Check if user already exist or not
    if (await UserDB.findOne({ email }))
      throw resError(409, "Email already exists!");
    if (await UserDB.findOne({ username }))
      throw resError(409, "Username already exists!");

    // Delete old verification
    if (await VerifyDB.findOne({ email })) await VerifyDB.deleteOne({ email });

    // Generate new token
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // e.g. "482391"
    const hashedPassword = Encoder.encode(password);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Create new verification
    await VerifyDB.create({
      name,
      username,
      email,
      password: hashedPassword,
      code,
      expiresAt,
    });

    // Load the HTML file
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    let htmlFile = fs.readFileSync(
      path.join(__dirname, "../../assets/html/verifySignup.html"),
      "utf8"
    );

    htmlFile = htmlFile.replace("{verificationCode}", code);
    // htmlFile = htmlFile.replace(
    //   "{logoImage}",
    //   `${process.env.SERVER_URL}/image/logo`
    // );

    // Send Email
    await sendEmail(email, `[${APP_NAME}] Verify Your Account`, htmlFile);

    resJson(res, 201, "Verification code email sent.");
  } catch (error) {
    next(error);
  }
};

export default register;
