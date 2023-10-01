/** @format */

// Import required dependencies
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const sequelize = require("./Utilities/database");

// Import Sequelize models
const User = require("./Models/userModel");
const Contact = require("./Models/contactModel");
const Group = require("./Models/groupModel");
const GroupMember = require("./Models/groupMemberModel");
const Message = require("./Models/messagesModel");
const Attachment = require("./Models/attachementModel");

// Import routes
const loginRoutes = require("./Routes/loginRoutes");
const userRoutes = require("./Routes/userRoutes");
const chatRoutes = require("./Routes/chatRoutes");
const groupRoutes = require("./Routes/groupRoutes");

// Create an Express application
const app = express();

// Middleware setup
app.use(bodyParser.json()); // Parse JSON requests
app.use(
	cors({
		origin: "http://127.0.0.1:5500", // Allow requests from this origin
		credentials: true,
	}),
);

// Define Sequelize model associations
Contact.belongsTo(User, { as: "user", foreignKey: "userId" });
Contact.belongsTo(User, { as: "contact", foreignKey: "contactId" });

Group.belongsTo(User, { as: "creator", foreignKey: "createdByUserId" });

GroupMember.belongsTo(User, { as: "user", foreignKey: "userId" });
GroupMember.belongsTo(Group, { as: "group", foreignKey: "groupId" });

Message.belongsTo(User, { as: "sender", foreignKey: "senderId" });
Message.belongsTo(User, { as: "receiver", foreignKey: "receiverId" });
Message.belongsTo(Group, { as: "group", foreignKey: "groupId" });

Attachment.belongsTo(Message, { as: "message", foreignKey: "messageId" });

// Register routes
app.use("/users", loginRoutes); // Routes for user login
app.use("/user", userRoutes); // Routes for user-related operations
app.use("/chat", chatRoutes); // Routes for chat-related operations
app.use("/groups", groupRoutes); // Routes for group-related operations

// Synchronize Sequelize models with the database
sequelize
	.sync()
	.then((response) => {
		const port = process.env.PORT || 3000; // Get the port from environment variables or use a default
		console.log(`Starting server on port: ${port}`);
		app.listen(port, () => {
			console.log("Server is running."); // Confirm that the server is running
		});
	})
	.catch((error) => {
		console.error("Error while starting / syncing the server:", error);
	});
