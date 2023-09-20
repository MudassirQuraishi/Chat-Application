const express = require("express");
const middleware = require("../middleware/authentication");
const userController = require("../Controllers/userController");

const router = express.Router();
router.get(
  "/contacts",
  middleware.authenticateToken,
  userController.getContacts
);
router.get(
  "/get-chat/:id",
  middleware.authenticateToken,
  userController.getChat
);
router.post(
  "/add-contact",
  middleware.authenticateToken,
  userController.addContact
);
router.get("/friends", middleware.authenticateToken, userController.getFriends);
module.exports = router;
