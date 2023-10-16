/** @format */

const User = require("../Models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const token = require("../middleware/tokenGeneration");

/**
 * User Signup
 *
 * Create a new user account and hash the password.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.signup = async (req, res) => {
	try {
		const saltRounds = 10;
		const { password } = req.body;

		bcrypt.hash(password, saltRounds, async (err, hash) => {
			if (err) {
				console.error("Error hashing password:", err);
				return res.status(500).json({ success: false, message: "Signup failed" });
			}

			const [user, created] = await User.findOrCreate({
				where: { email: req.body.email },
				defaults: {
					username: req.body.username,
					email: req.body.email,
					password: hash,
					phoneNumber: req.body.phoneNumber,
					lastSeen: new Date(),
					bio: "No Calls. Only Q Chat",
				},
			});

			if (created) {
				res.status(200).json({
					success: true,
					message: "User created successfully",
					user,
				});
			} else {
				res.status(304).json({ success: false, message: "User Already Exists" });
			}
		});
	} catch (error) {
		console.error("Error occurred during signup:", error);
		res.status(500).json({ message: "Signup failed", success: false, data: error.message });
	}
};

/**
 * User Signin
 *
 * Authenticate the user's credentials and generate a JWT token.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.signin = async (req, res) => {
	try {
		const { username, password } = req.body;

		const userData = await User.findAll({
			where: {
				[Op.or]: [{ email: username }, { username: username }],
			},
		});

		if (userData.length === 0) {
			return res.status(404).json({ message: "User not found", success: false });
		}

		const user = userData[0].dataValues;

		bcrypt.compare(password, user.password, async function (err, result) {
			if (err) {
				console.error("Error comparing passwords:", err);
				return res.status(500).json({ message: "Internal Server Error", success: false });
			}

			if (result) {
				const jwtToken = token.generateAuthenticationToken(user);
				const userId = user.id;
				const currentTime = new Date();

				await User.update({ lastSeen: currentTime }, { where: { id: userId } });

				res.status(200).json({
					message: "Logged in successfully",
					success: true,
					encryptedId: jwtToken,
					isPremium: user.isPremium,
				});
			} else {
				if (username === user.email) {
					res.status(401).json({ message: "Password mismatch", success: false });
				} else {
					res.status(401).json({ message: "Username mismatch", success: false });
				}
			}
		});
	} catch (error) {
		console.error("Error occurred during signin:", error);
		res.status(500).json({ message: "Signin failed", success: false, data: error.message });
	}
};
