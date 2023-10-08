const { DataTypes } = require("sequelize");
const sequelize = require("../Utilities/database");

// Define the User model
const User = sequelize.define("User", {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		allowNull: false,
		autoIncrement: true,
		//   The unique user identifier, auto-incremented integer.
	},
	username: {
		type: DataTypes.STRING,
		allowNull: false,
		//   The username of the user, which must not be null.
	},
	email: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
		//   The email address of the user, which must be unique.
	},
	phoneNumber: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
		//   The phone number of the user, which must be unique.
	},
	password: {
		type: DataTypes.STRING,
		allowNull: false,
		//   The hashed password of the user, which must not be null.
	},
	lastSeen: {
		type: DataTypes.DATE,
		defaultValue: new Date(),
		//   The date and time when the user was last seen, with a default value of the current date and time.
	},
	profile_picture: {
		type: DataTypes.STRING,
		defaultValue:
			"https://images.unsplash.com/photo-1542044896530-05d85be9b11a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1450&q=80",
		//   The URL of the user's profile picture, with a default value.
	},
	bio: DataTypes.TEXT,
	//   A text field for the user's biography.
});

// Export the User model
module.exports = User;
