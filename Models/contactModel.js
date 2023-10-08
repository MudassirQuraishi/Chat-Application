const { DataTypes } = require("sequelize");
const sequelize = require("../Utilities/database");

/**
 * Contact Model
 *
 * Represents a contact relationship between users.
 */
const Contact = sequelize.define("Contact", {
	requestStatus: {
		type: DataTypes.STRING,
		allowNull: false,
		defaultValue: "Pending",
		//  The status of the contact request, which is initially set to "Pending."
	},
	sentBy: {
		type: DataTypes.INTEGER,
		allowNull: false,
		//  The ID of the user who sent the contact request.
	},
});

// Export the Contact model
module.exports = Contact;
