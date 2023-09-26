const { DataTypes } = require("sequelize");
const sequelize = require("../Utilities/database");

const GroupMember = sequelize.define("GroupMember", {
  is_admin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = GroupMember;
