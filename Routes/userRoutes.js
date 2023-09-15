const express = require("express");
const userController = require("../Controllers/userController");

const router = express.Router();

router.post("/signup", userController.signup);
module.exports = router;
