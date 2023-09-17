const User = require("../Models/userModel");
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
