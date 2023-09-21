const { DataTypes } = require("sequelize");
const sequelize = require("../Utilities/database");

const Attachment = sequelize.define("Attachment", {
  file_path: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  file_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  uploaded_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

module.exports = Attachment;
