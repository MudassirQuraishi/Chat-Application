/** @format */

const Chat = require("../Models/messagesModel");
const User = require("../Models/userModel");
const { Op } = require("sequelize");

/**
 * Handle incoming chat message and save it to the database.
 *
 * @param {object} socket - The Socket.IO socket object representing the client connection.
 * @param {object} messageDetail - Details of the chat message, including message content, receiver, and conversation type.
 * @throws {Error} If there is an issue with message creation or database save.
 */
exports.addChat = async (socket, messageDetail) => {
	try {
		// Extract user information from the socket
		const { user } = socket;

		// Extract message details
		const { content, receiver, conversation_type, timeStamp } = messageDetail;

		// Create a new chat message and save it to the database
		const newChatMessage = await Chat.create({
			content: content,
			timeStamp: timeStamp,
			senderId: user.id,
			receiverId: receiver,
			conversation_type: conversation_type,
		});
		const receiverDetails = await User.findByPk(receiver);

		const newMessage = {
			...newChatMessage.dataValues,
			messageStatus: "received",
			profile_picture: receiverDetails.dataValues.profile_picture,
		};
		// Broadcast the new chat message to all connected clients
		socket.broadcast.emit("receive-message", newMessage);
		console.log("sent broadcast");
	} catch (error) {
		// Handle any errors that occur during message creation or saving
		console.error("Error in addChat:", error);
		throw new Error("Failed to save chat message");
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
		const { receiver_id } = req.params;

		const dbMessages = await Chat.count({
			where: {
				[Op.or]: [
					{ senderId: id, receiverId: receiver_id },
					{ senderId: receiver_id, receiverId: id },
				],
				conversation_type: "user",
			},
		});

		let offset = dbMessages <= 100 ? 0 : dbMessages - limit;
		const response = await Chat.findAll({
			where: {
				[Op.or]: [
					{ senderId: id, receiverId: receiver_id },
					{ senderId: receiver_id, receiverId: id },
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
exports.sendGroupChats = async (socket, messageDetail) => {
	try {
		const { user } = socket;
		const { content, receiver, conversation_type, timeStamp } = messageDetail;

		const newGroupMessage = await Chat.create({
			content: content,
			timeStamp: timeStamp,
			senderId: user.id,
			groupId: receiver,
			conversation_type: conversation_type,
		});
		const newMessage = {
			...newGroupMessage.dataValues,
			messageStatus: "received",
		};
		socket.broadcast.emit("group-message", newMessage);
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
		const { receiver_id } = req.params;
		const { user } = req;

		const dbMessages = await Chat.count({
			where: {
				groupId: receiver_id,
			},
		});

		let offset = dbMessages <= 100 ? 0 : dbMessages - limit;
		const response = await Chat.findAll({
			where: {
				groupId: receiver_id,
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
