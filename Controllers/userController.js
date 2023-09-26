const User = require("../Models/userModel");
const Contact = require("../Models/contactModel");
const Group = require("../Models/groupModel");
const { Op } = require("sequelize");

exports.getContacts = async (req, res) => {
  try {
    const { id } = req.user;
    const allContacts = await User.findAll({
      where: {
        id: {
          [Op.not]: id,
        },
      },
    });
    res.status(200).json({
      success: true,
      message: "Succesfully retrieved contacts",
      data: allContacts,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Couldnt retrieve contacts" });
  }
};
exports.getChat = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    res.status(200).json({ success: true, message: "retrieved chat", user });
  } catch (error) {
    res.status(404).json({ success: false, message: "error retrieving chat" });
  }
};

exports.getGroupChat = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await Group.findByPk(id);
    res.status(200).json({ success: true, message: "group chat found", group });
  } catch (error) {
    res.status(500).json({ success: false, message: "internal error", error });
  }
};

exports.addContact = async (req, res) => {
  const { id } = req.user;
  const { contactId } = req.body;
  try {
    const user = await User.findByPk(id);
    const contact = await User.findByPk(contactId);

    if (!user || !contact) {
      return res.status(404).json({ message: "User or contact not found." });
    }

    const existingContact = await Contact.findOne({
      where: {
        [Op.or]: [
          {
            userId: id,
            contactId: contactId,
            requestStatus: "Pending",
          },
          {
            userId: contactId, // Swap userId and contactId
            contactId: id, // Swap userId and contactId
            requestStatus: "Pending",
          },
        ],
      },
    });

    if (existingContact) {
      return res.status(203).json({ message: "Contact already added." });
    }

    await Contact.create({
      requestStatus: "Pending",
      userId: id,
      contactId: contactId,
      sentBy: id,
    });

    res.status(201).json({ message: "Contact added successfully." });
  } catch (error) {
    console.error("Error adding contact:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
exports.getRequests = async (req, res) => {
  const { id } = req.user;
  try {
    // Find friend requests where either userId or contactId is req.user.id and requestStatus is "Pending"
    const friends = await Contact.findAll({
      where: {
        [Op.or]: [
          { userId: id, requestStatus: "Pending" },
          { contactId: id, requestStatus: "Pending" },
        ],
        sentBy: {
          [Op.not]: id,
        },
      },
    });

    // Extract contactIds using map
    const contactIds = friends.map((friend) => friend.dataValues.sentBy);

    // Find users based on contactIds
    const allRequests = await User.findAll({ where: { id: contactIds } });

    res
      .status(200)
      .json({ success: true, message: "Success", data: allRequests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to get friends" });
  }
};
exports.getFriends = async (req, res) => {
  try {
    const { id } = req.user;
    const friends = await Contact.findAll({
      where: {
        [Op.or]: [
          { userId: id, requestStatus: "Accepted" },
          { contactId: id, requestStatus: "Accepted" },
        ],
      },
    });

    let userIds = [];
    let contactIds = [];
    for (let i = 0; i < friends.length; i++) {
      userIds[i] = friends[i].dataValues.userId;
      contactIds[i] = friends[i].dataValues.contactId;
    }

    const response = await User.findAll({
      where: { id: [...userIds, ...contactIds] },
    });
    const allFriends = response.map((contact) => {
      contact.dataValues.userId = req.user.id;
      return contact;
    });
    res.status(200).json({
      success: true,
      message: "Success",
      data: allFriends,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({ success: false, message: "Failed to get friends" });
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    const {
      user,
      body: { contactId },
    } = req;

    // Find the friend request to accept
    const [updatedCount] = await Contact.update(
      { requestStatus: "Accepted" },
      {
        where: {
          contactId: user.id,
          requestStatus: "Pending",
          sentBy: contactId,
        },
      }
    );

    if (updatedCount === 1) {
      res.status(200).json({ success: true, message: "Accepted" });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Friend request not found" });
    }
  } catch (error) {
    console.error("Error while accepting:", error);
    res.status(500).json({ success: false, message: "Error while accepting" });
  }
};
