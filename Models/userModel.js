const { DataTypes } = require("sequelize");
const sequelize = require("../Utilities/database");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastSeen: {
    type: DataTypes.DATE,
    defaultValue: new Date(),
  },
  profile_picture: {
    type: DataTypes.STRING,
    defaultValue:
      "https://images.unsplash.com/photo-1542044896530-05d85be9b11a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1450&q=80",
  },
  bio: DataTypes.TEXT,
});

module.exports = User;
