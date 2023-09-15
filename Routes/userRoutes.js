const express = require("express");
const userController = require("../Controllers/userController");

const router = express.Router();

router.post("/signup", userController.signup);

router.post("/login", userController.signin);
module.exports = router;
