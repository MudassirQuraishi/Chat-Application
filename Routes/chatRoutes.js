/** @format */

const express = require("express");
const middleware = require("../middleware/authentication");
const chatController = require("../Controllers/chatController");

// Create an Express Router
const router = express.Router();

/**
 * Send Chat Route
 *
 * Send a chat message to a user.
 *
 * @route POST /chat/send-chat
 * @authenticated
 * @param {Object} req.body - The message content and recipient information.
 * @returns {Object} A response indicating the success of the message send operation.
 */
router.post("/send-chat", middleware.authenticateToken, chatController.addChat);

/**
 * Send Group Chat Route
 *
 * Send a chat message to a group.
 *
 * @route POST /chat/send-group-chat
 * @authenticated
 * @param {Object} req.body - The message content and group information.
 * @returns {Object} A response indicating the success of the message send operation.
 */
router.post("/send-group-chat", middleware.authenticateToken, chatController.sendGroupChats);

/**
 * Get Chats Route
 *
 * Retrieve chat messages with a specific user.
 *
 * @route POST /chat/get-chat
 * @authenticated
 * @param {Object} req.body - The user ID to retrieve chat messages with.
 * @returns {Array} An array of chat messages.
 */
router.post("/get-chat", middleware.authenticateToken, chatController.getChats);

/**
 * Get Group Chats Route
 *
 * Retrieve chat messages in a specific group.
 *
 * @route POST /chat/get-groupchat
 * @authenticated
 * @param {Object} req.body - The group ID to retrieve chat messages from.
 * @returns {Array} An array of group chat messages.
 */
router.post("/get-groupchat", middleware.authenticateToken, chatController.getGroupChats);

// Export the router for use in other parts of the application
module.exports = router;
