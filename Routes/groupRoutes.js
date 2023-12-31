const express = require("express");
const middleware = require("../middleware/authentication");
const groupController = require("../Controllers/groupController");

// Create an Express Router
const router = express.Router();

/**
 * Create Group Route
 *
 * Creates a new group.
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
 * Retrieves the groups associated with the authenticated user.
 *
 * @route GET /groups/get-groups
 * @authenticated
 * @returns {Array} An array of user's groups.
 */
router.get("/get-groups", middleware.authenticateToken, groupController.getGroups);

/**
 * Check Admin Status Route
 *
 * Checks if the authenticated user is an admin of a specific group.
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
 * Retrieves contacts within a specific group.
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
 * Invites a user to join a specific group.
 *
 * @route POST /groups/:group_id/invite
 * @authenticated
 * @param {string} group_id - The ID of the group to invite the user to.
 * @param {Object} req.body - The user information to invite.
 * @returns {Object} A response indicating the success of the invitation.
 */
router.post("/:group_id/invite", middleware.authenticateToken, groupController.inviteMember);

/**
 * Delete Members Route
 *
 * Deletes one or more members from a specific group.
 *
 * @route POST /groups/:group_id/delete
 * @authenticated
 * @param {string} group_id - The ID of the group to remove members from.
 * @param {Object} req.body - The user information to delete.
 * @returns {Object} A response indicating the success of the deletion.
 */
router.post("/:group_id/delete", middleware.authenticateToken, groupController.deleteMembers);

/**
 * Make Admin Route
 *
 * Makes a user an admin of a specific group.
 *
 * @route POST /groups/:group_id/admin
 * @authenticated
 * @param {string} group_id - The ID of the group to upgrade the user as admin.
 * @param {Object} req.body - The user information to upgrade as admin.
 * @returns {Object} A response indicating the success of upgrading as admin.
 */
router.post("/:group_id/admin", middleware.authenticateToken, groupController.makeAdmin);

// Export the router for use in other parts of the application
module.exports = router;
