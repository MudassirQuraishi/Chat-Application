const express = require("express");

const middleware = require("../middleware/authentication");
const chatController = require("../Controllers/chatController");

const router = express.Router();

router.post("/send-chat", middleware.authenticateToken, chatController.addChat);

router.post("/get-chat", middleware.authenticateToken, chatController.getChats);

module.exports = router;
