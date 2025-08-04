import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import UserDB from "../../models/user.js";
import resJson from "../../utils/resJson.js";
import Token from "../../utils/token.js";
import resCookie from "../../utils/resCookie.js";
import UserPrivacyDB from "../../models/userPrivacy.js";
import sendEmail from "../../utils/sendEmail.js";
import { APP_NAME } from "../../constants/index.js";
import uploadAuthPhoto from "../../utils/uploadAuthPhoto.js";

const loginGoogle = async (req, res, next) => {
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
      let baseUsername = email.split("@")[0].replace(/\./g, "");
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

export default loginGoogle;
