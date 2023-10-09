/** @format */

const Group = require("../Models/groupModel");
const GroupMembers = require("../Models/groupMemberModel");

const User = require("../Models/userModel");
const { Op, sequelize } = require("sequelize");

/**
 * Create a New Group
 *
 * Create a new group and add the current user as the admin.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.createGroup = async (req, res) => {
	const t = await sequelize.transaction();
	try {
		const { name, description } = req.body;
		const { user } = req;

		const group = await Group.create(
			{
				group_name: name,
				group_description: description,
				createdByUserId: user.id,
			},
			{ transaction: t },
		);

		await GroupMembers.create(
			{
				userId: group.createdByUserId,
				groupId: group.id,
				is_admin: true,
			},
			{ transaction: t },
		);
		await t.commit();

		res.status(200).json({ success: true });
	} catch (error) {
		await t.rollback();
		console.error("Error creating group:", error);
		res.status(500).json({ success: false, error: "Internal Server Error" });
	}
};

/**
 * Get User's Groups
 *
 * Retrieve groups that the current user is a member of.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getGroups = async (req, res) => {
	try {
		const { user } = req;

		const groupMembers = await GroupMembers.findAll({
			where: {
				userId: user.id,
			},
		});

		const groupIds = groupMembers.map((group) => group.groupId);

		const groups = await Group.findAll({ where: { id: groupIds } });

		res.status(200).json({ success: true, data: groups });
	} catch (error) {
		console.error("Error getting user's groups:", error);
		res.status(500).json({ success: false, error: "Internal Server Error" });
	}
};

/**
 * Invite Members to a Group
 *
 * Invite users to join a group.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.inviteMember = async (req, res) => {
	try {
		const { user } = req;
		const { group_id } = req.params;
		const user_ids = req.body.user_ids; // An array of user_ids to invite

		// Verify that the group exists
		const group = await Group.findByPk(group_id);

		if (!group) {
			return res.status(404).json({ error: "Group not found" });
		}

		// Invite each user to the group
		user_ids.forEach(async (user_id) => {
			await GroupMembers.create({
				groupId: group_id,
				userId: user_id,
				is_admin: false, // Assuming invited users are not admins by default
			});
		});

		res.status(204).send(); // Successfully invited users
	} catch (error) {
		console.error("Error inviting members:", error);
		res.status(500).json({ success: false, error: "Internal Server Error" });
	}
};

/**
 * Check if User is Admin of a Group
 *
 * Check if the current user is an admin of the specified group.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.isAdmin = async (req, res) => {
	try {
		const { group_id } = req.params;
		const { user } = req;

		const groupMember = await GroupMembers.findOne({
			where: {
				groupId: group_id,
				is_admin: true,
			},
			attributes: ["userId"],
		});

		const isAdmin = groupMember && groupMember.userId === user.id;

		res.status(200).json({ success: true, isAdmin });
	} catch (error) {
		console.error("Error checking admin status:", error);
		res.status(500).json({ success: false, error: "Internal Server Error" });
	}
};

/**
 * Get Contacts for Group Invitation
 *
 * Retrieve users who can be invited to a group (excluding current members).
 * Retrieve users who are part of the group.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getContacts = async (req, res) => {
	try {
		const { group_id } = req.params;
		const { user } = req;

		const existingMembers = await GroupMembers.findAll({
			where: {
				groupId: group_id,
				userId: {
					[Op.ne]: user.id, // Exclude members with userId equal to user.id
				},
			},
			attributes: ["userId", "is_admin"],
		});

		const existingMembersIds = existingMembers.map((existingMember) => {
			return existingMember.userId;
		});
		existingMembersIds.push(user.id);
		const nonExistingUsers = await User.findAll({
			where: { id: { [Op.notIn]: existingMembersIds } },
			attributes: ["username", "id"],
		});
		existingMembersIds.pop();

		const existingUsers = await User.findAll({
			where: { id: { [Op.in]: existingMembersIds } },
			attributes: ["username", "id"],
		});

		const nonAdminMembers = await GroupMembers.findAll({
			where: {
				groupId: group_id,
				is_admin: false,
			},
		});
		const nonAdminIds = nonAdminMembers.map((nonAdminUser) => {
			return nonAdminUser.userId;
		});
		const nonAdminUsers = await User.findAll({
			where: { id: { [Op.in]: nonAdminIds } },
			attributes: ["username", "id"],
		});

		const data = {
			nonExistingUsers: nonExistingUsers,
			existingUsers: existingUsers,
			nonAdminUsers: nonAdminUsers,
		};

		res.status(200).json({ success: true, data: data });
	} catch (error) {
		console.error("Error getting contacts for group invitation:", error);
		res.status(500).json({ success: false, error: "Internal Server Error" });
	}
};
/**
 * Delete members from a group.
 *
 * Deletes specified users from a group by their IDs.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {Error} If there is an error during the database operation.
 */
exports.deleteMembers = async (req, res) => {
	try {
		// Extract data from the request
		const { user_ids } = req.body;
		const { user } = req;
		const { group_id } = req.params;

		// Check if user_ids is an array
		if (!Array.isArray(user_ids)) {
			return res.status(400).json({ success: false, error: "user_ids must be an array" });
		}

		// Check if user_ids contains at least one ID
		if (user_ids.length === 0) {
			return res.status(400).json({ success: false, error: "user_ids cannot be empty" });
		}

		// Delete users from the group using Sequelize's destroy method
		const deleteUsers = await GroupMembers.destroy({
			where: {
				[Op.and]: {
					groupId: group_id,
					userId: { [Op.in]: user_ids },
				},
			},
		});

		if (deleteUsers > 0) {
			// If any users were deleted, send a success response
			res.status(200).json({ success: true, message: "Members deleted successfully" });
		} else {
			// If no users were deleted, send a response indicating no changes
			res.status(200).json({ success: true, message: "No members were deleted" });
		}
	} catch (error) {
		// Handle errors gracefully and send an appropriate error response
		console.error(error);

		if (error.name === "SequelizeDatabaseError") {
			// Handle database-specific errors
			res.status(500).json({ success: false, error: "Database error" });
		} else {
			// Handle general errors
			res.status(500).json({ success: false, error: "Internal Server Error" });
		}
	}
};

/**
 * Make users administrators of a group.
 *
 * Grants administrator privileges to specified users within a group.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @throws {Error} If there is an error during the database operation.
 */
exports.makeAdmin = async (req, res) => {
	try {
		// Extract data from the request
		const { user } = req;
		const { user_ids } = req.body;
		const { group_id } = req.params;

		// Check if user_ids is an array
		if (!Array.isArray(user_ids)) {
			return res.status(400).json({ success: false, error: "user_ids must be an array" });
		}

		// Check if user_ids contains at least one ID
		if (user_ids.length === 0) {
			return res.status(400).json({ success: false, error: "user_ids cannot be empty" });
		}

		// Update users to grant admin privileges using Sequelize's update method
		const updateAdmin = await GroupMembers.update(
			{ is_admin: true },
			{
				where: {
					[Op.and]: {
						groupId: group_id,
						userId: { [Op.in]: user_ids },
					},
				},
			},
		);

		if (updateAdmin[0] > 0) {
			// If any users were updated, send a success response
			res.status(200).json({ success: true, message: "Admins updated successfully" });
		} else {
			// If no users were updated, send a response indicating no changes
			res.status(200).json({ success: true, message: "No admins were updated" });
		}
	} catch (error) {
		// Handle errors gracefully and send an appropriate error response
		console.error(error);

		if (error.name === "SequelizeDatabaseError") {
			// Handle database-specific errors
			res.status(500).json({ success: false, error: "Database error" });
		} else {
			// Handle general errors
			res.status(500).json({ success: false, error: "Internal Server Error" });
		}
	}
};
