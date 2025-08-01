import UserDB from "../../models/user.js";
import Encoder from "../../utils/encoder.js";
import resJson from "../../utils/resJson.js";
import Token from "../../utils/token.js";
import resError from "../../utils/resError.js";
import resCookie from "../../utils/resCookie.js";

import { OAuth2Client } from "google-auth-library";

const loginGoogle = async (req, res, next) => {
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  const { idToken } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { email, name, picture, sub: googleId } = payload;

    // TODO: You can create/find user in DB here
    // e.g., const user = await User.findOrCreate({ googleId, email })

    res.json({
      success: true,
      user: { email, name, picture, googleId },
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export default loginGoogle;
