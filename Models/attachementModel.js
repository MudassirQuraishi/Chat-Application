/** @format */

const { DataTypes } = require("sequelize");
const sequelize = require("../Utilities/database");

/**
 * Attachment Model
 *
 * Represents an attachment associated with a message.
 */
const Attachment = sequelize.define("Attachment", {
	file_path: {
		type: DataTypes.STRING,
		allowNull: false,
		//  The file path of the attachment, which must not be null.
	},
	file_type: {
		type: DataTypes.STRING,
		allowNull: false,
		//  The type of the attachment, which must not be null.
	},
	uploaded_at: {
		type: DataTypes.DATE,
		allowNull: false,
		//  The timestamp when the attachment was uploaded, which must not be null.
	},
});

// Export the Attachment model
module.exports = Attachment;
