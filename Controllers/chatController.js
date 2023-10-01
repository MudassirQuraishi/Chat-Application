/** @format */

const Chat = require("../Models/messagesModel");
const { Op } = require("sequelize");

/**
 * Add Chat Message
 *
 * Add a chat message from the authenticated user to another user.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.addChat = async (req, res) => {
	try {
		const { message, receiver } = req.body;
		const { user } = req;

		const sentMessage = await Chat.create({
			content: message,
			timeStamp: new Date(),
			senderId: user.id,
			receiverId: receiver,
			conversation_type: "user",
		});

		res.status(200).json({
			success: true,
			message: "Successfully sent chat",
			data: sentMessage,
		});
	} catch (error) {
		console.error("Error adding chat:", error);
		res.status(500).json({ success: false, message: "Internal Server Error" });
	}
};

/**
 * Get Chat Messages
 *
 * Retrieve chat messages between the authenticated user and another user.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getChats = async (req, res) => {
	const limit = 100;
	try {
		const { id } = req.user;
		const { receiver } = req.body;

		const dbMessages = await Chat.count({
			where: {
				[Op.or]: [
					{ senderId: id, receiverId: receiver },
					{ senderId: receiver, receiverId: id },
				],
				conversation_type: "user",
			},
		});

		let offset = dbMessages <= 100 ? 0 : dbMessages - limit;
		const response = await Chat.findAll({
			where: {
				[Op.or]: [
					{ senderId: id, receiverId: receiver },
					{ senderId: receiver, receiverId: id },
				],
				conversation_type: "user",
			},
			order: [["timeStamp", "ASC"]],
			offset: offset,
			limit: limit,
		});

		const messages = response.map((obj) => ({
			...obj.dataValues,
			messageStatus: obj.dataValues.senderId == id ? "sent" : "received",
			prevMessages: offset > 0 ? true : false,
		}));

		res.status(200).json({
			success: true,
			message: "Retrieved All Chats",
			data: messages,
		});
	} catch (error) {
		console.error("Error getting chats:", error);
		res.status(500).json({
			success: false,
			message: "Internal Server Error. Error Getting Chats",
		});
	}
};

/**
 * Send Group Chat Message
 *
 * Send a chat message from the authenticated user to a group.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.sendGroupChats = async (req, res) => {
	try {
		const { message, receiver } = req.body;
		const { user } = req;

		await Chat.create({
			content: message,
			conversation_type: "group",
			senderId: user.id,
			groupId: receiver,
			timeStamp: new Date(),
		});

		res.status(200).json({ success: true });
	} catch (error) {
		console.error("Error sending group chat:", error);
		res.status(500).json({ success: false, message: "Internal Server Error" });
	}
};

/**
 * Get Group Chat Messages
 *
 * Retrieve chat messages within a specific group.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.getGroupChats = async (req, res) => {
	try {
		const limit = 100;
		const { receiver } = req.body;
		const { user } = req;

		const dbMessages = await Chat.count({
			where: {
				groupId: receiver,
			},
		});

		let offset = dbMessages <= 100 ? 0 : dbMessages - limit;
		const response = await Chat.findAll({
			where: {
				groupId: receiver,
			},
			order: [["timestamp", "ASC"]],
			offset: offset,
			limit: limit,
		});

		const messages = response.map((obj) => ({
			...obj.dataValues,
			messageStatus: obj.dataValues.senderId == user.id ? "sent" : "received",
			prevMessages: offset > 0 ? true : false,
		}));

		res.status(200).json({
			success: true,
			message: "Retrieved All Chats",
			data: messages,
		});
	} catch (error) {
		console.error("Error getting group chats:", error);
		res.status(500).json({
			success: false,
			message: "Internal Server Error. Error Getting Chats",
		});
	}
};
