import express from "express";
const router = express.Router();

import { BeenTogetherSchema } from "../utils/schema.js";
import { validateBody, validateToken } from "../utils/validator.js";
import {
  createOrOpenBeenTogether,
  editBeenTogether,
} from "../controllers/beenTogether/beenTogether.js";

router
  .route("/")
  .post(validateToken(), createOrOpenBeenTogether)
  .patch(
    validateToken(),
    validateBody(BeenTogetherSchema.edit),
    editBeenTogether
  );

export default router;
