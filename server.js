// Import required dependencies
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const http = require("http");
const sequelize = require("./Utilities/database");

// Import Sequelize models
const User = require("./Models/userModel");
const Contact = require("./Models/contactModel");
const Group = require("./Models/groupModel");
const GroupMember = require("./Models/groupMemberModel");
const Message = require("./Models/messagesModel");

// Import routes
const loginRoutes = require("./Routes/loginRoutes");
const userRoutes = require("./Routes/userRoutes");
const chatRoutes = require("./Routes/chatRoutes");
const groupRoutes = require("./Routes/groupRoutes");

const chatController = require("./Controllers/chatController");
const authenticateSocket = require("./middleware/authenticateSocket");

// Create an Express application
const app = express();
const server = http.createServer(app);
const socketIo = require("socket.io");
const io = socketIo(server);

// Middleware setup
app.use(bodyParser.json()); // Parse JSON requests
app.use(
	cors({
		origin: ["http://127.0.0.1:5501", "http://127.0.0.1:3000"], // Allow requests from these origins
		credentials: true,
	}),
);
app.use(express.static("Front-End"));

// Define Sequelize model associations
Contact.belongsTo(User, { as: "user", foreignKey: "userId" });
Contact.belongsTo(User, { as: "contact", foreignKey: "contactId" });

Group.belongsTo(User, { as: "creator", foreignKey: "createdByUserId" });

GroupMember.belongsTo(User, { as: "user", foreignKey: "userId" });
GroupMember.belongsTo(Group, { as: "group", foreignKey: "groupId" });

Message.belongsTo(User, { as: "sender", foreignKey: "senderId" });
Message.belongsTo(User, { as: "receiver", foreignKey: "receiverId" });
Message.belongsTo(Group, { as: "group", foreignKey: "groupId" });

// Register routes
app.use("/users", loginRoutes); // Routes for user login
app.use("/user", userRoutes); // Routes for user-related operations
app.use("/chat", chatRoutes); // Routes for chat-related operations
app.use("/groups", groupRoutes); // Routes for group-related operations

// Serve the signup HTML page
app.get("/signup.html", (req, res) => {
	console.log("Request for signup.html");
	res.sendFile(__dirname + `/Front-End/Html/${req.url}`);
});

// Handle WebSocket connections
io.on("connection", (socket) => {
	// Authenticate the socket connection
	authenticateSocket(socket, (err) => {
		if (err) {
			// Handle authentication error
			console.error("Authentication error:", err.message);
			socket.disconnect(true); // Disconnect the socket
		} else {
			// Authentication successful, handle chat logic
			console.log("User authentication successful");

			// Handle individual messages
			socket.on("send-message", (messageDetail) => {
				chatController.addChat(socket, messageDetail);
				console.log("Message sent");
			});

			// Handle group chat messages
			socket.on("send-group-message", (messageDetail) => {
				console.log("Received group message");
				chatController.sendGroupChats(socket, messageDetail);
				console.log("Group message sent");
			});
		}
	});
});

// Synchronize Sequelize models with the database
sequelize
	.sync()
	.then((response) => {
		const port = process.env.PORT || 3000; // Get the port from environment variables or use a default
		console.log(`Server started on port: ${port}`);
		server.listen(port, () => {
			console.log("Server is running.");
		});
	})
	.catch((error) => {
		console.error("Error while starting/syncing the server:", error);
	});
