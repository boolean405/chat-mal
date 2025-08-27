import express from "express";
const router = express.Router();

import { createEvent, getPaginatedEvents } from "../controllers/event/event.js";
import {
  validateBody,
  validateParam,
  validateToken,
} from "../utils/validator.js";
import { EventSchema } from "../utils/schema.js";

router
  .route("/")
  .post(validateToken(), validateBody(EventSchema.create), createEvent);

router.get(
  "/paginate/:sort/:pageNum",
  validateToken(),
  validateParam(EventSchema.params.pageNum, "pageNum"),
  validateParam(EventSchema.params.sort, "sort"),
  getPaginatedEvents
);

export default router;
