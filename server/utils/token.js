import jwt from "jsonwebtoken";

const Token = {
  makeRefreshToken: (payload) =>
    jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "1m" }),

  verifyRefreshToken: (payload) =>
    jwt.verify(payload, process.env.REFRESH_TOKEN_SECRET),

  makeAccessToken: (payload) =>
    jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15s" }),

  verifyAccessToken: (payload) =>
    jwt.verify(payload, process.env.ACCESS_TOKEN_SECRET),
};

export default Token;
