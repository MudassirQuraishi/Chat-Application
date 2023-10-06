/** @format */

const Sequelize = require("sequelize");

// Load database configuration from environment variables
const SCHEMA = process.env.DB_SCHEMA;
const USER = process.env.DB_USER;
const PASSWORD = process.env.DB_PASSWORD;
const HOST = process.env.DB_HOST;

/**
 * Initialize Sequelize
 *
 * This module initializes the Sequelize instance for connecting to the database.
 *
 * @type {Sequelize} An instance of the Sequelize library configured for the database.
 */
const sequelize = new Sequelize(SCHEMA, USER, PASSWORD, {
	dialect: "mysql", // Set the database dialect to MySQL
	host: HOST, // Set the database host
	logging: false, // Enable logging of SQL queries
});

// Export the configured Sequelize instance
module.exports = sequelize;
