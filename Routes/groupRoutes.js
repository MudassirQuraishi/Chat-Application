/** @format */

const express = require("express");
const middleware = require("../middleware/authentication");
const groupController = require("../Controllers/groupController");

// Create an Express Router
const router = express.Router();

/**
 * Create Group Route
 *
 * Create a new group.
 *
 * @route POST /groups/create-group
 * @authenticated
 * @param {Object} req.body - The group information.
 * @returns {Object} A response indicating the success of the group creation.
 */
router.post("/create-group", middleware.authenticateToken, groupController.createGroup);

/**
 * Get Groups Route
 *
 * Retrieve the groups associated with the authenticated user.
 *
 * @route GET /groups/get-groups
 * @authenticated
 * @returns {Array} An array of user's groups.
 */
router.get("/get-groups", middleware.authenticateToken, groupController.getGroups);

/**
 * Check Admin Status Route
 *
 * Check if the authenticated user is an admin of a specific group.
 *
 * @route GET /groups/:group_id/isAdmin
 * @authenticated
 * @param {string} group_id - The ID of the group to check.
 * @returns {Object} A response indicating whether the user is an admin of the group.
 */
router.get("/:group_id/isAdmin", middleware.authenticateToken, groupController.isAdmin);

/**
 * Get Group Contacts Route
 *
 * Retrieve contacts within a specific group.
 *
 * @route GET /groups/:group_id/contacts
 * @authenticated
 * @param {string} group_id - The ID of the group to retrieve contacts from.
 * @returns {Array} An array of group contacts.
 */
router.get("/:group_id/contacts", middleware.authenticateToken, groupController.getContacts);

/**
 * Invite Member Route
 *
 * Invite a user to join a specific group.
 *
 * @route POST /groups/:group_id/invite
 * @authenticated
 * @param {string} group_id - The ID of the group to invite the user to.
 * @param {Object} req.body - The user information to invite.
 * @returns {Object} A response indicating the success of the invitation.
 */
router.post("/:group_id/invite", middleware.authenticateToken, groupController.inviteMember);

// Export the router for use in other parts of the application
module.exports = router;
