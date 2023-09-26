const Sequelize = require("sequelize");
const SCHEMA = process.env.DB_SCHEMA;
const USER = process.env.DB_USER;
const PASSWORD = process.env.DB_PASSWORD;
const HOST = process.env.DB_HOST;

const sequelize = new Sequelize(SCHEMA, USER, PASSWORD, {
  dialect: "mysql",
  host: HOST,
  logging: true,
});
module.exports = sequelize;
