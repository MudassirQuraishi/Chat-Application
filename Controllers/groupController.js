/** @format */

const Group = require("../Models/groupModel");
const GroupMembers = require("../Models/groupMemberModel");
const Contact = require("../Models/contactModel");
const User = require("../Models/userModel");
const { Op } = require("sequelize");

/**
 * Create a New Group
 *
 * Create a new group and add the current user as the admin.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.createGroup = async (req, res) => {
	try {
		const { name, description } = req.body;
		const { user } = req;

		const group = await Group.create({
			group_name: name,
			group_description: description,
			createdByUserId: user.id,
		});

		await GroupMembers.create({
			userId: group.createdByUserId,
			groupId: group.id,
			is_admin: true,
		});

		res.status(200).json({ success: true });
	} catch (error) {
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
		for (const user_id of user_ids) {
			await GroupMembers.create({
				groupId: group_id,
				userId: user_id,
				is_admin: false, // Assuming invited users are not admins by default
			});
		}

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
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getContacts = async (req, res) => {
	try {
		const { group_id } = req.params;
		const { user } = req;

		const groupMembers = await GroupMembers.findAll({
			where: { groupId: group_id },
			attributes: ["userId"],
		});

		const groupIds = groupMembers.map((groupMember) => groupMember.userId);

		const inviteMembers = await User.findAll({
			where: { id: { [Op.not]: groupIds } },
		});

		res.status(200).json({ success: true, data: inviteMembers });
	} catch (error) {
		console.error("Error getting contacts for group invitation:", error);
		res.status(500).json({ success: false, error: "Internal Server Error" });
	}
};
