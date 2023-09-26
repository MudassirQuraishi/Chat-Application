const Chat = require("../Models/messagesModel");

const { Op } = require("sequelize");

exports.addChat = async (req, res) => {
  try {
    const { message, receiverId } = req.body;
    const { user } = req;
    const sentMessage = await Chat.create({
      content: message,
      timeStamp: new Date(),
      senderId: user.id,
      receiverId: receiverId,
      conversation_type: "user",
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
  const limit = 100;
  try {
    const { id } = req.user;
    const { receiver } = req.body;
    const dbMessges = await Chat.count({
      where: {
        [Op.or]: [
          { senderId: id, receiverId: receiver },
          { senderId: receiver, receiverId: id },
        ],
        conversation_type: "user",
      },
    });
    let offset = dbMessges <= 100 ? 0 : dbMessges - limit;
    const response = await Chat.findAll({
      where: {
        [Op.or]: [
          { senderId: id, receiverId: receiver },
          { senderId: receiver, receiverId: id },
        ],
        conversation_type: "user",
      },
      order: [["timestamp", "ASC"]],
      offset: offset,
      limit: limit,
    });

    const messages = response.map((obj) => ({
      ...obj.dataValues,
      ["messageStatus"]: obj.dataValues.senderId == id ? "sent" : "recieved",
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
exports.sendGroupChats = async (req, res) => {
  try {
    const { message, receiver } = req.body;
    const { user } = req;
    const chat = await Chat.create({
      content: message,
      conversation_type: "group",
      senderId: user.id,
      groupId: receiver,
      timeStamp: new Date(),
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server" });
  }
};

exports.getGroupChats = async (req, res) => {
  try {
    const limit = 100;
    const { receiver } = req.body;
    const { user } = req;
    const dbMessages = await Chat.count({
      where: {
        groupId: receiver,
      },
    });
    let offset = dbMessages <= 100 ? 0 : dbMessages - limit;
    const response = await Chat.findAll({
      where: {
        groupId: receiver,
      },
      order: [["timestamp", "ASC"]],
      offset: offset,
      limit: limit,
    });

    const messages = response.map((obj) => ({
      ...obj.dataValues,
      ["messageStatus"]:
        obj.dataValues.senderId == user.id ? "sent" : "recieved",
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
