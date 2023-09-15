const Sequelize = require("sequelize");
const sequelize = require("../Utilities/database");

const User = sequelize.define("userTable", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  phoneNumber: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  lastSeen: {
    type: Sequelize.STRING,
  },
});

module.exports = User;
