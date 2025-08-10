import express from "express";
const router = express.Router();

import { ChatSchema } from "../utils/schema.js";
import createOrOpen from "../controllers/chat/createOrOpen.js";
import {
  validateBody,
  validateParam,
  validateQuery,
  validateToken,
} from "../utils/validator.js";
import createGroup from "../controllers/chat/createGroup.js";
import changeName from "../controllers/chat/changeName.js";
import addUsersToGroup from "../controllers/chat/addUsersToGroup.js";
import removeUserFromGroup from "../controllers/chat/removeUserFromGroup.js";
import leaveGroup from "../controllers/chat/leaveGroup.js";
import deleteChat from "../controllers/chat/deleteChat.js";
import getPaginateChats from "../controllers/chat/getPaginateChats.js";
import getChat from "../controllers/chat/getChat.js";
import getPaginateRequestChats from "../controllers/chat/getPaginateRequestChat.js";
import acceptChatRequest from "../controllers/chat/acceptChatRequest.js";
import readChat from "../controllers/chat/readChat.js";
import removeAdminFromGroup from "../controllers/chat/removeAdminFromGroup.js";
import addAdminToGroup from "../controllers/chat/addAdminToGroup.js";
import unarchiveChat from "../controllers/chat/unarchiveChat.js";
import archiveChat from "../controllers/chat/archiveChat.js";
import getPaginatedGroupChats from "../controllers/chat/getPaginateGroupChats.js";

router.post(
  "/",
  validateToken(),
  validateBody(ChatSchema.createOrOpen),
  createOrOpen
);

router.get(
  "/:chatId",
  validateToken(),
  validateParam(ChatSchema.params.chatId, "chatId"),
  getChat
);

router.get(
  "/paginate/:pageNum",
  validateToken(),
  validateParam(ChatSchema.params.pageNum, "pageNum"),
  getPaginateChats
);

router.get(
  "/request/paginate/:pageNum",
  validateToken(),
  validateParam(ChatSchema.params.pageNum, "pageNum"),
  getPaginateRequestChats
);

router.post(
  "/create-group",
  validateToken(),
  validateBody(ChatSchema.createGroup),
  createGroup
);
router.patch(
  "/change-name",
  validateToken(),
  validateBody(ChatSchema.changeName),
  changeName
);
router.patch(
  "/add-users-to-group",
  validateToken(),
  validateBody(ChatSchema.addUsersToGroup),
  addUsersToGroup
);
router.patch(
  "/add-admin-to-group",
  validateToken(),
  validateBody(ChatSchema.addAdminToGroup),
  addAdminToGroup
);
router.patch(
  "/remove-user-from-group",
  validateToken(),
  validateBody(ChatSchema.removeUserFromGroup),
  removeUserFromGroup
);
router.patch(
  "/leave-group",
  validateToken(),
  validateBody(ChatSchema.leaveGroup),
  leaveGroup
);
router.patch(
  "/delete-chat",
  validateBody(ChatSchema.deleteChat),
  validateToken(),
  deleteChat
);
router.patch(
  "/accept-chat-request",
  validateToken(),
  validateBody(ChatSchema.acceptChatRequest),
  acceptChatRequest
);
router.patch(
  "/read-chat",
  validateToken(),
  validateBody(ChatSchema.readChat),
  readChat
);
router.patch(
  "/remove-admin-from-group",
  validateToken(),
  validateBody(ChatSchema.removeAdminFromGroup),
  removeAdminFromGroup
);
router.patch(
  "/archive-chat",
  validateToken(),
  validateBody(ChatSchema.archiveChat),
  archiveChat
);
router.patch(
  "/unarchive-chat",
  validateToken(),
  validateBody(ChatSchema.unarchiveChat),
  unarchiveChat
);
router.get(
  "/group/paginate/:type/:sort/:pageNum",
  validateToken(),
  validateParam(ChatSchema.params.groupType, "type"),
  validateParam(ChatSchema.params.pageNum, "pageNum"),
  validateParam(ChatSchema.params.sort, "sort"),
  getPaginatedGroupChats
);

export default router;
