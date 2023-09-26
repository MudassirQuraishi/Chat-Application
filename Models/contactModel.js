const { DataTypes } = require("sequelize");
const sequelize = require("../Utilities/database");

const Contact = sequelize.define("Contact", {
  requestStatus: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Pending",
  },
  sentBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Contact;
