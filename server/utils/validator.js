import Token from "./token.js";
import resError from "./resError.js";
import UserDB from "../models/user.js";

const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) return next(resError(400, error.details[0].message));
    next();
  };
};

const validateToken = () => {
  return async (req, res, next) => {
    const authHeader = await req.headers.authorization;
    if (!authHeader?.startsWith("Bearer "))
      return next(resError(401, "Need Authorization!"));

    const token = authHeader.split(" ")[1];
    const decoded = Token.verifyAccessToken(token);
    req.userId = decoded.id;
    const user = await UserDB.findById(decoded.id);
    if (!user) return next(resError(401, "Authenticated user not found!"));
    req.user = user;
    next();
  };
};

const validateCookie = () => {
  return async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;
    // if (!refreshToken) return next(resError(401, "Need refresh token cookie!"));
    if (!refreshToken) return next();
    const decoded = Token.verifyRefreshToken(refreshToken);
    if (decoded) req.decodedId = decoded.id;
    next();
  };
};

const validateParam = (schema, param) => {
  return (req, res, next) => {
    let obj = {};
    obj[`${param}`] = req.params[`${param}`];
    let result = schema.validate(obj);
    if (result.error) {
      const error = new Error(result.error.message);
      error.status = 400;
      return next(error);
    }
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query);
    if (error) return next(resError(400, error.details[0].message));
    // req.query = value;
    next();
  };
};

const validateMessage = (schema, data) => {
  const { error, value } = schema.validate(data);
  if (error) {
    return { valid: false, error: error.details[0].message };
  }
  return { valid: true, value };
};

export {
  validateBody,
  validateToken,
  validateCookie,
  validateParam,
  validateQuery,
  validateMessage,
};
