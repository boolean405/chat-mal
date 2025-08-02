import UserDB from "../../models/user.js";
import Encoder from "../../utils/encoder.js";
import resJson from "../../utils/resJson.js";
import Token from "../../utils/token.js";
import resError from "../../utils/resError.js";
import resCookie from "../../utils/resCookie.js";

import { OAuth2Client } from "google-auth-library";

// const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
// const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
// const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
});

const loginGoogle = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    res.json({
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      },
    });
  } catch (error) {
    next(error);
  }
};
// const loginGoogle = async (req, res, next) => {
//   const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
//   const { idToken } = req.body;
//   console.log(idToken);

//   console.log('masuk');

//   try {
//     const ticket = await client.verifyIdToken({
//       idToken,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });

//     const payload = ticket.getPayload();

//     const { email, name, picture, sub: googleId } = payload;

//     // TODO: You can create/find user in DB here
//     // e.g., const user = await User.findOrCreate({ googleId, email })

//     res.json({
//       success: true,
//       user: { email, name, picture, googleId },
//     });
//   } catch (error) {
//     console.error("Google Auth Error:", error);
//     res.status(401).json({ success: false, message: "Invalid token" });
//   }
// };

export default loginGoogle;
