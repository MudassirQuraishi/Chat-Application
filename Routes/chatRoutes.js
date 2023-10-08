const express = require("express");
const middleware = require("../middleware/authentication");
const chatController = require("../Controllers/chatController");

// Create an Express Router
const router = express.Router();

/**
 * Send Chat Route
 *
 * Sends a chat message to a user.
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
 * Sends a chat message to a group.
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
 * Retrieves chat messages with a specific user.
 *
 * @route GET /chat/get-chat/:receiver_id
 * @authenticated
 * @param {string} receiver_id - The user ID to retrieve chat messages with.
 * @returns {Array} An array of chat messages.
 */
router.get("/get-chat/:receiver_id", middleware.authenticateToken, chatController.getChats);

/**
 * Get Group Chats Route
 *
 * Retrieves chat messages in a specific group.
 *
 * @route GET /chat/get-groupchat/:receiver_id
 * @authenticated
 * @param {string} receiver_id - The group ID to retrieve chat messages from.
 * @returns {Array} An array of group chat messages.
 */
router.get("/get-groupchat/:receiver_id", middleware.authenticateToken, chatController.getGroupChats);

/**
 * Send Attachment Route
 *
 * Sends an attachment (e.g., file) to a user or group.
 *
 * @route POST /chat/upload/:receiverId
 * @authenticated
 * @param {string} receiverId - The user or group ID to send the attachment to.
 * @returns {Object} A response indicating the success of the attachment send operation.
 */
router.post("/upload/:receiverId", middleware.authenticateToken, chatController.sendAttachment);

// Export the router for use in other parts of the application
module.exports = router;
