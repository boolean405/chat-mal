import express from "express";
const router = express.Router();

import { UserSchema } from "../utils/schema.js";
import register from "../controllers/user/register.js";
import login from "../controllers/user/login.js";
import refresh from "../controllers/user/refresh.js";
import logout from "../controllers/user/logout.js";
import getUser from "../controllers/user/getUser.js";
import deleteAccount from "../controllers/user/deleteAccount.js";
import uploadPicture from "../controllers/user/uploadPicture.js";
import profilePicture from "../controllers/user/profilePicture.js";
import changePassword from "../controllers/user/changePassword.js";
import changeName from "../controllers/user/changeName.js";
import changeUsername from "../controllers/user/changeUsername.js";
import getPicture from "../controllers/user/getPicture.js";
import uploadPhoto from "../controllers/user/uploadPhoto.js";
import existEmail from "../controllers/user/existEmail.js";
import existUsername from "../controllers/user/existUsername.js";
import forgotPassword from "../controllers/user/forgotPassword.js";
import resetPassword from "../controllers/user/resetPassword.js";
import changeNames from "../controllers/user/changeNames.js";
import registerVerify from "../controllers/user/registerVerify.js";
import deletePhoto from "../controllers/user/deltePhoto.js";
import getPaginateUsers from "../controllers/user/getPaginateUsers.js";
import forgotPasswordVerify from "../controllers/user/forgotPasswrodVerify.js";

import {
  validateBody,
  validateToken,
  validateCookie,
  validateParam,
  validateQuery,
} from "../utils/validator.js";

router.get("/exist-email", validateQuery(UserSchema.existEmail), existEmail);
router.get(
  "/exist-username",
  validateQuery(UserSchema.existUsername),
  existUsername
);

router.post("/register", validateBody(UserSchema.register), register);
router.post("/login", validateBody(UserSchema.login), login);
router.post("/logout", validateCookie(), logout);
router.post("/refresh", validateCookie(), refresh);
router.get("/", validateToken(), getUser);

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

router.get(
  "/picture/:userId",
  validateParam(UserSchema.params.userId, "userId"),
  getPicture
);

router
  .route("/picture")
  .all(validateToken())
  .get(profilePicture)
  .post(uploadPicture);

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
  "/paginate/:pageNum",
  validateToken(),
  validateParam(UserSchema.params.pageNum, "pageNum"),
  // validateQuery(UserSchema.query.keyword),
  getPaginateUsers
);

export default router;
