const { DataTypes } = require("sequelize");
const sequelize = require("../Utilities/database");

const Contact = sequelize.define("Contact", {});

module.exports = Contact;
