/** @format */

// Import necessary libraries
const jwt = require("jsonwebtoken");

// Import User model
const User = require("../Models/userModel");

/**
 * Middleware: Authenticate Token for WebSocket connections
 *
 * This middleware is used to authenticate a user based on a JSON Web Token (JWT)
 * during WebSocket connection. It verifies the token provided in the
 * socket.handshake.auth.token and attaches the authenticated user's information to the socket object.
 *
 * @param {Object} socket - Socket.io socket object.
 * @param {function} next - The next middleware function.
 */
const authenticateSocket = (socket, next) => {
	const token = socket.handshake.auth.token;

	// Check if a token is provided
	if (!token) {
		return next(new Error("Authentication error: Token missing"));
	}

	try {
		// Verify the token using the JWT secret key
		const secretKey = process.env.JWT_SECRET_KEY;
		const decodedId = jwt.verify(token, secretKey);

		// Find the user associated with the decoded ID
		User.findByPk(decodedId.id).then((loggedInUserData) => {
			if (!loggedInUserData) {
				return next(new Error("Authentication error: Invalid token"));
			}

			// Attach the user data to the socket object
			socket.user = loggedInUserData.dataValues;
			next();
		});
	} catch (error) {
		// Handle JWT verification errors
		console.error("Error in authentication:", error);
		next(new Error("Authentication error: Invalid token"));
	}
};

module.exports = authenticateSocket;
