const express = require("express");

const middleware = require("../middleware/authentication");
const chatController = require("../Controllers/chatController");

const router = express.Router();

router.post("/send-chat", middleware.authenticateToken, chatController.addChat);
router.post(
  "/send-group-chat",
  middleware.authenticateToken,
  chatController.sendGroupChats
);

router.post("/get-chat", middleware.authenticateToken, chatController.getChats);
router.post(
  "/get-groupchat",
  middleware.authenticateToken,
  chatController.getGroupChats
);

module.exports = router;
