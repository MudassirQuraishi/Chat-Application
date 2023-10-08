const express = require("express");
const userController = require("../Controllers/loginController");

// Create an Express Router
const router = express.Router();

/**
 * Signup Route
 *
 * This route is used for user registration.
 *
 * @route POST /users/signup
 * @returns {Object} A response indicating the success or failure of user registration.
 */
router.post("/signup", userController.signup);

/**
 * Login Route
 *
 * This route is used for user login.
 *
 * @route POST /users/login
 * @returns {Object} A response indicating the success or failure of user login.
 */
router.post("/login", userController.signin);

// Export the router for use in other parts of the application
module.exports = router;
