const express = require("express");
const middleware = require("../middleware/authentication");
const userController = require("../Controllers/userController");

// Create an Express Router
const router = express.Router();

/**
 * Get User Contacts
 *
 * Retrieves the contacts of the authenticated user.
 *
 * @route GET /user/contacts
 * @authenticated
 * @returns {Array} An array of user contacts.
 */
router.get("/contacts", middleware.authenticateToken, userController.getContacts);

/**
 * Get Contact Requests
 *
 * Retrieves pending contact requests for the authenticated user.
 *
 * @route GET /user/get-requests
 * @authenticated
 * @returns {Array} An array of contact requests.
 */
router.get("/get-requests", middleware.authenticateToken, userController.getRequests);

/**
 * Get Chat Conversation
 *
 * Retrieves a chat conversation with a specific user.
 *
 * @route GET /user/get-chat/:id
 * @authenticated
 * @param {string} id - The ID of the user to retrieve the chat with.
 * @returns {Object} A chat conversation.
 */
router.get("/get-chat/:id", middleware.authenticateToken, userController.getChat);

/**
 * Get Group Chat Conversation
 *
 * Retrieves a group chat conversation by ID.
 *
 * @route GET /user/get-group-chat/:id
 * @authenticated
 * @param {string} id - The ID of the group chat to retrieve.
 * @returns {Object} A group chat conversation.
 */
router.get("/get-group-chat/:id", middleware.authenticateToken, userController.getGroupChat);

/**
 * Accept Contact Request
 *
 * Accepts a contact request from another user.
 *
 * @route POST /user/add-user
 * @authenticated
 * @returns {Object} A response indicating the success of the request acceptance.
 */
router.post("/add-user", middleware.authenticateToken, userController.acceptRequest);

/**
 * Add Contact
 *
 * Sends a contact request to another user.
 *
 * @route POST /user/add-contact
 * @authenticated
 * @returns {Object} A response indicating the success of the contact request.
 */
router.post("/add-contact", middleware.authenticateToken, userController.addContact);

/**
 * Get User Friends
 *
 * Retrieves the friends of the authenticated user.
 *
 * @route GET /user/friends
 * @authenticated
 * @returns {Array} An array of user friends.
 */
router.get("/friends", middleware.authenticateToken, userController.getFriends);

/**
 * Get Self Details
 *
 * Retrieves details of the authenticated user.
 *
 * @route GET /user/self
 * @authenticated
 * @returns {Object} Details of the authenticated user.
 */
router.get("/self", middleware.authenticateToken, userController.getSelfDetails);

// Export the router for use in other parts of the application
module.exports = router;
