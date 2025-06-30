import express from "express";
const router = express.Router();

import resJson from "../utils/resJson.js";

const publicData = {
  name: "Chat Mal Server",
};

router.get("/", (req, res) => {
  resJson(res, 200, "Success", publicData);
});

export default router;
