/** @format */

const User = require("../Models/userModel");
const Contact = require("../Models/contactModel");
const Group = require("../Models/groupModel");
const { Op } = require("sequelize");

/**
 * Get user contacts
 *
 * Retrieve all contacts of the logged-in user.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getContacts = async (req, res) => {
	try {
		const { id } = req.user;
		const allContacts = await User.findAll({
			where: {
				id: {
					[Op.not]: id,
				},
			},
		});
		res.status(200).json({
			success: true,
			message: "Successfully retrieved contacts",
			data: allContacts,
		});
	} catch (error) {
		console.error("Error while retrieving contacts:", error);
		res.status(500).json({ success: false, message: "Failed to retrieve contacts" });
	}
};

/**
 * Get user chat
 *
 * Retrieve chat details for a specific user.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getChat = async (req, res) => {
	try {
		const { id } = req.params;
		const user = await User.findByPk(id);
		if (!user) {
			res.status(404).json({ success: false, message: "User not found" });
		} else {
			res.status(200).json({ success: true, message: "Retrieved chat", user });
		}
	} catch (error) {
		console.error("Error while retrieving chat:", error);
		res.status(500).json({ success: false, message: "Error retrieving chat" });
	}
};

/**
 * Get group chat
 *
 * Retrieve group chat details for a specific group.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getGroupChat = async (req, res) => {
	try {
		const { id } = req.params;
		const group = await Group.findByPk(id);
		if (!group) {
			res.status(404).json({ success: false, message: "Group not found" });
		} else {
			res.status(200).json({ success: true, message: "Group chat found", group });
		}
	} catch (error) {
		console.error("Error while retrieving group chat:", error);
		res.status(500).json({ success: false, message: "Internal server error" });
	}
};

/**
 * Add contact
 *
 * Add a user to the contacts list.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.addContact = async (req, res) => {
	const { id } = req.user;
	const { contactId } = req.body;
	try {
		const user = await User.findByPk(id);
		const contact = await User.findByPk(contactId);

		if (!user || !contact) {
			return res.status(404).json({ message: "User or contact not found" });
		}

		const existingContact = await Contact.findOne({
			where: {
				[Op.or]: [
					{
						userId: id,
						contactId: contactId,
						requestStatus: "Pending",
					},
					{
						userId: contactId,
						contactId: id,
						requestStatus: "Pending",
					},
				],
			},
		});

		if (existingContact) {
			return res.status(203).json({ message: "Contact already added" });
		}

		await Contact.create({
			requestStatus: "Pending",
			userId: id,
			contactId: contactId,
			sentBy: id,
		});

		res.status(201).json({ message: "Contact added successfully" });
	} catch (error) {
		console.error("Error adding contact:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

/**
 * Get friend requests
 *
 * Retrieve friend requests for the logged-in user.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getRequests = async (req, res) => {
	const { id } = req.user;
	try {
		const friends = await Contact.findAll({
			where: {
				[Op.or]: [
					{ userId: id, requestStatus: "Pending" },
					{ contactId: id, requestStatus: "Pending" },
				],
				sentBy: {
					[Op.not]: id,
				},
			},
		});

		const contactIds = friends.map((friend) => friend.dataValues.sentBy);
		const allRequests = await User.findAll({ where: { id: contactIds } });

		res.status(200).json({ success: true, message: "Success", data: allRequests });
	} catch (error) {
		console.error("Error while getting friend requests:", error);
		res.status(500).json({ success: false, message: "Failed to get friend requests" });
	}
};

/**
 * Get friends
 *
 * Retrieve the list of friends for the logged-in user.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getFriends = async (req, res) => {
	try {
		const { id } = req.user;
		const friends = await Contact.findAll({
			where: {
				[Op.or]: [
					{ userId: id, requestStatus: "Accepted" },
					{ contactId: id, requestStatus: "Accepted" },
				],
			},
		});

		let userIds = [];
		let contactIds = [];
		for (let i = 0; i < friends.length; i++) {
			userIds[i] = friends[i].dataValues.userId;
			contactIds[i] = friends[i].dataValues.contactId;
		}

		const response = await User.findAll({
			where: { id: [...userIds, ...contactIds] },
		});

		const allFriends = response.map((contact) => {
			contact.dataValues.userId = req.user.id;
			return contact;
		});

		res.status(200).json({
			success: true,
			message: "Success",
			data: allFriends,
		});
	} catch (error) {
		console.error("Error while getting friends:", error);
		res.status(500).json({ success: false, message: "Failed to get friends" });
	}
};

/**
 * Accept friend request
 *
 * Accept a friend request from another user.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.acceptRequest = async (req, res) => {
	try {
		const {
			user,
			body: { contactId },
		} = req;

		const [updatedCount] = await Contact.update(
			{ requestStatus: "Accepted" },
			{
				where: {
					contactId: user.id,
					requestStatus: "Pending",
					sentBy: contactId,
				},
			},
		);

		if (updatedCount === 1) {
			res.status(200).json({ success: true, message: "Accepted" });
		} else {
			res.status(404).json({ success: false, message: "Friend request not found" });
		}
	} catch (error) {
		console.error("Error while accepting friend request:", error);
		res.status(500).json({
			success: false,
			message: "Error while accepting friend request",
		});
	}
};
