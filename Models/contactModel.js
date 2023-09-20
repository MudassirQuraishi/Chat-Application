const { DataTypes } = require("sequelize");
const sequelize = require("../Utilities/database"); // Replace with your Sequelize configuration

const Contact = sequelize.define("Contact", {});

module.exports = Contact;
