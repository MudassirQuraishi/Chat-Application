const { DataTypes } = require("sequelize");
const sequelize = require("../Utilities/database");

const Group = sequelize.define("Group", {
  profile_picture: {
    type: DataTypes.STRING,
    defaultValue:
      "https://images.unsplash.com/photo-1542044896530-05d85be9b11a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1450&q=80",
  },
  group_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  group_description: {
    type: DataTypes.STRING,
  },
});

module.exports = Group;
