/** @format */

// Import required dependencies
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const http = require("http");
const sequelize = require("./Utilities/database");
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const uuid = require("uuid").v4();

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

Attachment.belongsTo(Message, { as: "message", foreignKey: "messageId" });
// const s3 = new aws.S3();

// const storage = multer.memoryStorage(); // Store the file in memory
// const upload = multer({
// 	storage: multerS3({
// 		s3: s3,
// 		bucket: process.env.AWS_BUCKET_NAME,
// 		contentType: multerS3.AUTO_CONTENT_TYPE,
// 		acl: "public-read", // Adjust permissions as needed
// 		key: function (req, file, cb) {
// 			// Generate a unique key for each file
// 			const ext = file.originalname.split(".").pop();
// 			const key = `${Date.now().toString()}.${ext}`;
// 			cb(null, key);
// 		},
// 	}),
// });

// app.post("/upload", upload.single("file"), (req, res) => {
// 	console.log("Request body:", req.body);
// 	console.log("Request file:", req.file);

// 	if (!req.file) {
// 		return res.status(400).json({ error: "No file uploaded." });
// 	}

// 	// Continue processing or saving the file.
// });

// Register routes
app.use("/users", loginRoutes); // Routes for user login
app.use("/user", userRoutes); // Routes for user-related operations
app.use("/chat", chatRoutes); // Routes for chat-related operations
app.use("/groups", groupRoutes); // Routes for group-related operations
app.get("/signup.html", (req, res) => {
	console.log(req.url);
	res.sendFile(__dirname + `/Front-End/Html/${req.url}`);
});

io.on("connection", (socket) => {
	// Use the authenticateSocket middleware here
	authenticateSocket(socket, (err) => {
		if (err) {
			// Handle authentication error
			console.error("Authentication error:", err.message);
			socket.disconnect(true); // Disconnect the socket
		} else {
			// Authentication successful, handle your chat logic here
			console.log("User authentication succesfull");
			socket.on("send-message", (messageDetail) => {
				chatController.addChat(socket, messageDetail);
				console.log("came back ");
			});

			//groupMessages
			socket.on("send-group-message", (messageDetail) => {
				console.log("hello");
				chatController.sendGroupChats(socket, messageDetail);
				console.log("cameback");
			});
		}
	});
});

// Synchronize Sequelize models with the database
sequelize
	.sync()
	.then((response) => {
		const port = process.env.PORT || 3000; // Get the port from environment variables or use a default
		console.log(`Starting server on port: ${port}`);
		server.listen(port, () => {
			console.log("Server is running."); // Confirm that the server is running
		});
	})
	.catch((error) => {
		console.error("Error while starting / syncing the server:", error);
	});
