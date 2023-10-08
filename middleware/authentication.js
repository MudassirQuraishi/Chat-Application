// Import necessary libraries
const jwt = require("jsonwebtoken");

// Import User model
const User = require("../Models/userModel");

/**
 * Authenticate Token Middleware
 *
 * Middleware for authenticating a user based on a JSON Web Token (JWT).
 * It verifies the token provided in the request's "Authorization" header and attaches the authenticated user's information to the request object.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {function} next - The next middleware function.
 */
exports.authenticateToken = async (req, res, next) => {
	const token = req.headers.authorization;

	// Check if a token is provided
	if (!token) {
		return res.status(401).json({ error: "Unauthorized: Token missing" });
	}

	try {
		// Verify the token using the JWT secret key
		const secretKey = process.env.JWT_SECRET_KEY;
		const decodedId = jwt.verify(token, secretKey);

		// Find the user associated with the decoded ID
		const loggedInUserData = await User.findByPk(decodedId.id);

		if (!loggedInUserData) {
			return res.status(401).json({ error: "Unauthorized: Invalid token" });
		}

		// Attach the user data to the request object
		req.user = loggedInUserData.dataValues;
		next();
	} catch (error) {
		// Handle JWT verification errors
		console.error("Error in authentication:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};
