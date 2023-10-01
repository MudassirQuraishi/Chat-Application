/** @format */

const { DataTypes } = require("sequelize");
const sequelize = require("../Utilities/database");

/**
 * Message Model
 *
 * Represents a message in a conversation.
 */
const Message = sequelize.define("Message", {
	content: {
		type: DataTypes.TEXT,
		allowNull: false,
		//  The content of the message, which must not be null.
	},
	conversation_type: {
		type: DataTypes.ENUM("user", "group"),
		allowNull: true,
		defaultValue: "user",
		//  The type of conversation (either "user" or "group") and defaults to "user".
	},
	timeStamp: {
		type: DataTypes.DATE,
		allowNull: false,
		//  The timestamp of the message, which must not be null.
	},
});

// Export the Message model
module.exports = Message;
