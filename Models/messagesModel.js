const { DataTypes } = require("sequelize");
const sequelize = require("../Utilities/database"); // Replace with your Sequelize configuration

const Message = sequelize.define("Message", {
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  conversation_type: {
    type: DataTypes.ENUM("user", "group"),
    allowNull: true,
    defaultValue: "user",
  },
  timeStamp: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

module.exports = Message;
