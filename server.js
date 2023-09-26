const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const sequelize = require("./Utilities/database");

const User = require("./Models/userModel");
const Contact = require("./Models/contactModel");
const Group = require("./Models/groupModel");
const GroupMember = require("./Models/groupMemberModel");
const Message = require("./Models/messagesModel");
const Attachment = require("./Models/attachementModel");

const loginRoutes = require("./Routes/loginRoutes");
const userRoutes = require("./Routes/userRoutes");
const chatRoutes = require("./Routes/chatRoutes");
const groupRoutes = require("./Routes/groupRoutes");

const app = express();
app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://127.0.0.1:5500",
    credentials: true,
  })
);
Contact.belongsTo(User, { as: "user", foreignKey: "userId" });
Contact.belongsTo(User, { as: "contact", foreignKey: "contactId" });

Group.belongsTo(User, { as: "creator", foreignKey: "createdByUserId" });

GroupMember.belongsTo(User, { as: "user", foreignKey: "userId" });
GroupMember.belongsTo(Group, { as: "group", foreignKey: "groupId" });

Message.belongsTo(User, { as: "sender", foreignKey: "senderId" });
Message.belongsTo(User, { as: "receiver", foreignKey: "receiverId" });
Message.belongsTo(Group, { as: "group", foreignKey: "groupId" });

Attachment.belongsTo(Message, { as: "message", foreignKey: "messageId" });

app.use("/users", loginRoutes);
app.use("/user", userRoutes);
app.use("/chat", chatRoutes);
app.use("/groups", groupRoutes);

sequelize
  // .sync({ alter: true })
  .sync()
  .then((response) => {
    const port = process.env.PORT;
    console.log(`Starting server on ----------> port: ${port}`);
    app.listen(port);
  })
  .catch((error) => {
    console.log(error);
    console.log("Error Starting / Syncing the server");
  });
