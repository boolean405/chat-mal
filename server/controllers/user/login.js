import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import Token from "../../utils/token.js";
import UserDB from "../../models/user.js";
import resJson from "../../utils/resJson.js";
import Encoder from "../../utils/encoder.js";
import resError from "../../utils/resError.js";
import resCookie from "../../utils/resCookie.js";
import sendEmail from "../../utils/sendEmail.js";
import { APP_NAME } from "../../constants/index.js";
import UserPrivacyDB from "../../models/userPrivacy.js";
import uploadAuthPhoto from "../../utils/uploadAuthPhoto.js";

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const existUser = await UserDB.findOne({ email });
    if (!existUser) {
      throw resError(404, "User not found!");
    }

    const correctPassword = Encoder.compare(password, existUser.password);
    if (!correctPassword) {
      throw resError(401, "Incorrect password!");
    }

    const refreshToken = Token.makeRefreshToken({
      id: existUser._id.toString(),
    });
    const accessToken = Token.makeAccessToken({
      id: existUser._id.toString(),
    });

    const user = await UserDB.findByIdAndUpdate(
      existUser._id,
      {
        refreshToken,
      },
      {
        new: true,
      }
    ).select("-password");

    resCookie(req, res, "refreshToken", refreshToken);
    resJson(res, 200, "Success signin.", { user, accessToken });
  } catch (error) {
    next(error);
  }
};

export const loginGoogle = async (req, res, next) => {
  try {
    const { name, email, profilePhoto: photourl, googleId } = req.body;
    let newUser = false;

    // 1. Try to find user by Google auth provider
    let user = await UserDB.findOne({
      authProviders: {
        $elemMatch: { provider: "google", providerId: googleId },
      },
    });

    // 2. Fallback to email lookup
    if (!user) {
      user = await UserDB.findOne({ email });

      // If found, but Google is not linked, link it
      if (user) {
        const alreadyLinked = user.authProviders?.some(
          (p) => p.provider === "google" && p.providerId === googleId
        );

        if (!alreadyLinked) {
          user = await UserDB.findByIdAndUpdate(
            user._id,
            {
              $addToSet: {
                authProviders: {
                  provider: "google",
                  providerId: googleId,
                },
              },
            },
            { new: true }
          );
        }
      }
    }

    // 3. New user creation
    if (!user) {
      newUser = true;
      const baseUsername = email.split("@")[0].replace(/\./g, "");
      let username = baseUsername;
      let count = 1;

      while (await UserDB.exists({ username })) {
        username = `${baseUsername}${count++}`;
      }

      const profilePhoto = await uploadAuthPhoto({
        username,
        photourl,
        type: "profilePhoto",
        folder: "chat-mal/users/profile-photo",
      });

      user = await UserDB.create({
        name,
        email,
        username,
        profilePhoto,
        authProviders: [{ provider: "google", providerId: googleId }],
      });

      await UserPrivacyDB.create({ user: user._id });
    }

    // 4. Create tokens
    const refreshToken = Token.makeRefreshToken({ id: user._id.toString() });
    const accessToken = Token.makeAccessToken({ id: user._id.toString() });

    // 5. Update user with refresh token
    user = await UserDB.findByIdAndUpdate(
      user._id,
      { refreshToken },
      { new: true, select: "-password" }
    );

    // 6. Send login email
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const htmlFile = fs.readFileSync(
      path.join(__dirname, "../../assets/html/successLoginGoogle.html"),
      "utf8"
    );

    await sendEmail(
      user.email,
      `[${APP_NAME}] Login Success with Google Account`,
      htmlFile
    );

    // 7. Send response with tokens
    resCookie(req, res, "refreshToken", refreshToken);
    return resJson(
      res,
      newUser ? 201 : 200,
      "Success login with google account.",
      {
        user,
        accessToken,
      }
    );
  } catch (error) {
    next(error);
  }
};
