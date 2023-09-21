const User = require("../Models/userModel");
const Chat = require("../Models/messagesModel");
const { Op } = require("sequelize");
const sequelize = require("../Utilities/database");

exports.addChat = async (req, res) => {
  try {
    const message = req.body.message;
    const recieverId = JSON.parse(req.body.receiver);
    const senderId = req.user.id;
    const sentMessage = await Chat.create({
      content: message,
      timeStamp: new Date(),
      senderId: senderId,
      receiverId: recieverId,
    });
    res.status(200).json({
      success: true,
      message: "Successfully sent chat",
      data: sentMessage,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.getChats = async (req, res) => {
  const limit = 10;
  try {
    const senderId = req.user.id;
    const recieverId = req.body.receiver;
    const dbMessges = await Chat.count({
      where: {
        [Op.or]: [
          { senderId: senderId, receiverId: recieverId },
          { senderId: recieverId, receiverId: senderId },
        ],
        conversation_type: "user",
      },
    });
    let offset = dbMessges <= 10 ? 0 : dbMessges - limit;
    const response = await Chat.findAll({
      where: {
        [Op.or]: [
          { senderId: senderId, receiverId: recieverId },
          { senderId: recieverId, receiverId: senderId },
        ],
        conversation_type: "user",
      },
      order: [["timestamp", "ASC"]],
      offset: offset,
      limit: limit,
    });

    console.log(limit);
    const messages = response.map((obj) => ({
      ...obj.dataValues,
      ["messageStatus"]:
        obj.dataValues.senderId == senderId ? "sent" : "recieved",
      ["prevMessages"]: offset > 0 ? true : false,
    }));
    res
      .status(200)
      .json({ success: true, message: "Retrievd All Chats", data: messages });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error. Error Getting Chats",
    });
  }
};
