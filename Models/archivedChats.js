const { DataTypes } = require("sequelize");
const sequelize = require("../Utilities/database");

/**
 * ArchivedMessage Model
 *
 * Represents an archived message in a conversation.
 */
const ArchivedMessage = sequelize.define("ArchivedMessage", {
	content: {
		type: DataTypes.TEXT,
		allowNull: false,
		// The content of the archived message, which must not be null.
	},
	conversation_type: {
		type: DataTypes.ENUM("user", "group"),
		allowNull: true,
		defaultValue: "user",
		// The type of conversation (either "user" or "group") and defaults to "user".
	},
	timeStamp: {
		type: DataTypes.DATE,
		allowNull: false,
		// The timestamp of the archived message, which must not be null.
	},
	isAttachment: {
		type: DataTypes.BOOLEAN,
		defaultValue: false,
	},
	fileLocation: {
		type: DataTypes.TEXT,
	},
});

// Export the ArchivedMessage model
module.exports = ArchivedMessage;
