import express from "express";
const router = express.Router();

import { MessageSchema } from "../utils/schema.js";
import {
  validateBody,
  validateParam,
  validateToken,
} from "../utils/validator.js";

import createMessage from "../controllers/message/createMessage.js";
import getPaginateMessages from "../controllers/message/getPaginateMessages.js";

router.post(
  "/",
  validateToken(),
  validateBody(MessageSchema.createMessage),
  createMessage
);

router.get(
  "/paginate/:chatId/:pageNum",
  validateToken(),
  validateParam(MessageSchema.params.chatId, "chatId"),
  validateParam(MessageSchema.params.pageNum, "pageNum"),
  getPaginateMessages
);

export default router;
