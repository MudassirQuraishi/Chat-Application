const User = require("../Models/userModel");
const Contact = require("../Models/contactModel");
const { Op } = require("sequelize");
const Sequelize = require("sequelize");

exports.getContacts = async (req, res) => {
  try {
    const response = await User.findAll({
      where: {
        id: {
          [Sequelize.Op.not]: req.user.id,
        },
      },
    });
    res.status(200).json({
      success: true,
      message: "Succesfully retrieved contacts",
      data: response,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Couldnt retrieve contacts" });
  }
};
exports.getChat = async (req, res) => {
  try {
    console.log(req.params.id);
    const user = await User.findByPk(req.params.id);
    res.status(200).json({ success: true, message: "retrieved chat", user });
  } catch (error) {
    res.status(404).json({ success: false, message: "error retrieving chat" });
  }
};

exports.addContact = async (req, res) => {
  const userId = req.user.id;
  const contactId = req.body.contactId;
  try {
    // Check if the user and contact exist
    const user = await User.findByPk(userId);
    const contact = await User.findByPk(contactId);

    if (!user || !contact) {
      return res.status(404).json({ message: "User or contact not found." });
    }

    // Check if the contact is not already added
    const existingContact = await Contact.findOne({
      where: { userId: userId, contactId: contactId },
    });

    if (existingContact) {
      return res.status(203).json({ message: "Contact already added." });
    }

    // Create a new contact entry
    await Contact.create({ userId, contactId });

    res.status(201).json({ message: "Contact added successfully." });
  } catch (error) {
    console.error("Error adding contact:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
exports.getFriends = async (req, res) => {
  try {
    const friends = await Contact.findAll({ where: { userId: req.user.id } });
    const id = [];
    for (let i = 0; i < friends.length; i++) {
      id[i] = friends[i].dataValues.contactId;
    }

    const repsonse = await User.findAll({ where: { id: id } });
    res.status(200).json({ success: true, message: "Success", data: repsonse });
  } catch (error) {
    console.log(error);
    s;
    res.status(500).json({ success: false, message: "Failed to get friends" });
  }
};
