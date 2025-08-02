import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { OAuth2Client } from "google-auth-library";

import UserDB from "../../models/user.js";
import resJson from "../../utils/resJson.js";
import Token from "../../utils/token.js";
import resCookie from "../../utils/resCookie.js";
import UserPrivacyDB from "../../models/userPrivacy.js";
import sendEmail from "../../utils/sendEmail.js";
import { APP_NAME } from "../../constants/index.js";

const client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
});

const loginGoogle = async (req, res, next) => {
  try {
    const idToken = req.body.idToken;
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email, name, picture, sub: googleId } = ticket.getPayload();

    // 1. Find by Google ID in authProviders
    let user = await UserDB.findOne({
      authProviders: {
        $elemMatch: { provider: "google", providerId: googleId },
      },
    });

    // 2. Not found? Try fallback by email
    if (!user) {
      user = await UserDB.findOne({ email });

      // User exists but only with local? Return warning
      if (user) {
        const hasGoogleProvider = user.authProviders?.some(
          (p) => p.provider === "google"
        );

        if (!hasGoogleProvider) {
          return resJson(
            res,
            200,
            "Account already exists with email. Please login using email and password."
          );
        }
      }
    }

    // 3. New user? Create
    if (!user) {
      let baseUsername = email.split("@")[0].replace(/\./g, "");
      let username = baseUsername;
      let count = 1;

      while (await UserDB.exists({ username })) {
        username = `${baseUsername}${count++}`;
      }

      user = await UserDB.create({
        name,
        email,
        username,
        profilePhoto: picture,
        authProviders: [{ provider: "google", providerId: googleId }],
      });

      await UserPrivacyDB.create({ user: user._id });
    } else {
      // 4. User exists but might not have Google provider linked yet
      const alreadyLinked = user.authProviders.some(
        (p) => p.provider === "google" && p.providerId === googleId
      );

      if (!alreadyLinked) {
        await UserDB.updateOne(
          { _id: user._id },
          {
            $addToSet: {
              authProviders: {
                provider: "google",
                providerId: googleId,
              },
            },
          }
        );
      }
    }

    // 5. Create tokens
    const refreshToken = Token.makeRefreshToken({ id: user._id.toString() });
    const accessToken = Token.makeAccessToken({ id: user._id.toString() });

    // 6. Update refresh token
    user = await UserDB.findByIdAndUpdate(
      user._id,
      { refreshToken },
      { new: true, select: "-password" }
    );

    // 7. Send email
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

    // 8. Final response
    resCookie(req, res, "refreshToken", refreshToken);
    return resJson(res, 201, "Success login with Google.", {
      user,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};
export default loginGoogle;
