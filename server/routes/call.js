import express from "express";
import getCallLog from "../controllers/call/getCallLog.js";

const router = express.Router();

// Get call logs for a user
router.get("/", getCallLog);

export default router;
