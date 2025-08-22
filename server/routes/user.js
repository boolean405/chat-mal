import express from "express";
const router = express.Router();

import {
  validateBody,
  validateToken,
  validateCookie,
  validateParam,
  validateQuery,
} from "../utils/validator.js";

import {
  follow,
  unfollow,
  isFollowing,
  getPaginatedFollowUsers,
} from "../controllers/user/follow.js";

import { UserSchema } from "../utils/schema.js";
import register from "../controllers/user/register.js";
import { login, loginGoogle } from "../controllers/user/login.js";
import refresh from "../controllers/user/refresh.js";
import logout from "../controllers/user/logout.js";
import deleteAccount from "../controllers/user/deleteAccount.js";
import changeName from "../controllers/user/changeName.js";
import changeUsername from "../controllers/user/changeUsername.js";
import uploadPhoto from "../controllers/user/uploadPhoto.js";
import existEmail from "../controllers/user/existEmail.js";
import existUsername from "../controllers/user/existUsername.js";
import forgotPassword from "../controllers/user/forgotPassword.js";
import resetPassword from "../controllers/user/resetPassword.js";
import changeNames from "../controllers/user/changeNames.js";
import registerVerify from "../controllers/user/registerVerify.js";
import deletePhoto from "../controllers/user/deletePhoto.js";
import forgotPasswordVerify from "../controllers/user/forgotPasswrodVerify.js";

import updatePushToken from "../controllers/user/updaetPushToken.js";
import getMe from "../controllers/user/getMe.js";
import { block, isBlocked, unblock } from "../controllers/user/block.js";
import getPaginatedUsers from "../controllers/user/getPaginatedUsers.js";
import { changePassword } from "../controllers/user/changePassword.js";
import { createLocalPassword } from "../controllers/user/createLocalPassword.js";

router.get("/exist-email", validateQuery(UserSchema.existEmail), existEmail);
router.get(
  "/exist-username",
  validateQuery(UserSchema.existUsername),
  existUsername
);

router.post("/register", validateBody(UserSchema.register), register);
router.post("/login", validateBody(UserSchema.login), login);
router.post("/logout", validateToken(), validateCookie(), logout);
router.post("/refresh", validateCookie(), refresh);
router.get("/", validateToken(), getMe);

router.post(
  "/register-verify",
  validateBody(UserSchema.registerVerify),
  registerVerify
);
router.delete(
  "/delete-account",
  validateToken(),
  validateBody(UserSchema.deleteAccount),
  deleteAccount
);

router.patch(
  "/change-name",
  validateToken(),
  validateBody(UserSchema.changeName),
  changeName
);

router.patch(
  "/change-username",
  validateToken(),
  validateBody(UserSchema.changeUsername),
  changeUsername
);

router.patch(
  "/change-password",
  validateToken(),
  validateBody(UserSchema.changePassword),
  changePassword
);

router.patch(
  "/create-local-password",
  validateToken(),
  validateBody(UserSchema.createLocalPassword),
  createLocalPassword
);

router.patch(
  "/upload-photo",
  validateToken(),
  validateBody(UserSchema.uploadPhoto),
  uploadPhoto
);

router.patch(
  "/delete-photo",
  validateToken(),
  validateBody(UserSchema.deletePhoto),
  deletePhoto
);

router.patch(
  "/change-names",
  validateToken(),
  validateBody(UserSchema.changeNames),
  changeNames
);

router.post(
  "/forgot-password",
  validateBody(UserSchema.forgotPassword),
  forgotPassword
);

router.post(
  "/forgot-password-verify",
  validateBody(UserSchema.forgotPasswordVerify),
  forgotPasswordVerify
);

router.patch(
  "/reset-password",
  validateBody(UserSchema.resetPassword),
  resetPassword
);

router.get(
  "/paginate/:sort/:pageNum",
  validateToken(),
  validateParam(UserSchema.params.pageNum, "pageNum"),
  validateParam(UserSchema.params.sort, "sort"),
  // validateQuery(UserSchema.query.keyword),
  getPaginatedUsers
);

router.post(
  "/update-push-token",
  validateToken(),
  validateBody(UserSchema.updatePushToken),
  updatePushToken
);

router.post("/login-google", validateBody(UserSchema.loginGoogle), loginGoogle);

// Follow
router.post(
  "/follow",
  validateToken(),
  validateBody(UserSchema.follow),
  follow
);
router.delete(
  "/unfollow/:userId",
  validateToken(),
  validateParam(UserSchema.params.userId, "userId"),
  unfollow
);
router.get(
  "/is-following/:userId",
  validateToken(),
  validateParam(UserSchema.params.userId, "userId"),
  isFollowing
);
router.get(
  "/paginate/follow/:type/:sort/:pageNum",
  validateToken(),
  validateParam(UserSchema.params.pageNum, "pageNum"),
  validateParam(UserSchema.params.type, "type"),
  validateParam(UserSchema.params.sort, "sort"),
  getPaginatedFollowUsers
);

// Block
router.post("/block", validateToken(), validateBody(UserSchema.block), block);
router.delete(
  "/unblock/:userId",
  validateToken(),
  validateParam(UserSchema.params.userId, "userId"),
  unblock
);
router.get(
  "/is-blocked/:userId",
  validateToken(),
  validateParam(UserSchema.params.userId, "userId"),
  isBlocked
);

export default router;
