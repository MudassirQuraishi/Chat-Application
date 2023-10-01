/** @format */

const { DataTypes } = require("sequelize");
const sequelize = require("../Utilities/database");

/**
 * GroupMember Model
 *
 * Represents a member's association with a group.
 */
const GroupMember = sequelize.define("GroupMember", {
	is_admin: {
		type: DataTypes.BOOLEAN,
		defaultValue: false,
		//  Indicates whether the member is an administrator of the group (default: false).
	},
});

// Export the GroupMember model
module.exports = GroupMember;
