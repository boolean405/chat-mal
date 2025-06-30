const clearCookie = (req, res, key) => {
  const isLocalhost =
    req.hostname === "localhost" || req.hostname === "127.0.0.1";
  res.clearCookie(key, {
    httpOnly: true,
    sameSite: isLocalhost ? "Lax" : "None",
    secure: !isLocalhost,
  });
};

export default clearCookie;
