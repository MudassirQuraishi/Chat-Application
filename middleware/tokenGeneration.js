/** @format */

const jwt = require("jsonwebtoken");

/**
 * Generate Authentication Token
 *
 * This function generates an authentication token based on user data.
 *
 * @param {Object} data - User data to be included in the token.
 * @returns {string} The generated JWT token.
 * @throws {Error} If there is an issue generating the token.
 */
exports.generateAuthenticationToken = (data) => {
	try {
		// Extract the user ID from the data
		const { id } = data;

		// Get the JWT secret key from environment variables
		const secretKey = process.env.JWT_SECRET_KEY;

		// Generate the JWT token with the user ID
		const token = jwt.sign({ id }, secretKey);

		return token;
	} catch (error) {
		// Handle any errors that occur during token generation
		console.error("Error generating authentication token:", error);
		throw new Error("Error generating authentication token");
	}
};
