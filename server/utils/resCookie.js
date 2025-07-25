const resCookie = (req, res, key, value, options = {}) => {
  const isLocalhost =
    req.hostname === "localhost" || req.hostname === "127.0.0.1";
  res.cookie(key, value, {
    httpOnly: true,
    sameSite: isLocalhost ? "Lax" : "None",
    secure: !isLocalhost,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    ...options,
  });
};

export default resCookie;
