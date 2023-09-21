const User = require("../Models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

exports.signup = async (req, res) => {
  try {
    const saltRounds = 10;
    const password = req.body.password;
    bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (err) {
        console.log(err);
        return;
      }
      const data = await User.findOrCreate({
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
      if (data[1]) {
        res
          .status(200)
          .json({ success: true, message: "User created successfully", data });
      } else {
        res
          .status(201)
          .json({ success: true, message: " User Already Exists" });
      }
    });
  } catch (error) {
    console.log("Error occured during saving user Data to DB", error);
    res
      .status(500)
      .json({ message: "Signup failed", success: false, data: error.message });
  }
};

function generateAutheticationToken(data) {
  const id = data.id;
  const secretKey = process.env.JWT_SECRET_KEY;
  const token = jwt.sign(id, secretKey);
  return token;
}

exports.signin = async (req, res) => {
  try {
    const data = await User.findAll({
      where: {
        [Op.or]: [
          { email: req.body.username },
          { username: req.body.username },
        ],
      },
    });
    if (data.length === 0) {
      res.status(404).json({ message: "User not found", success: false });
    } else {
      const jwtToken = generateAutheticationToken(data[0].dataValues);
      const inputCredentials = req.body;
      const databaseCredentials = data[0].dataValues;
      const userId = databaseCredentials.id;
      const currentTime = new Date();

      bcrypt.compare(
        inputCredentials.password,
        databaseCredentials.password,
        async function (err, result) {
          if (result) {
            const response = await User.update(
              { lastSeen: currentTime },
              { where: { id: userId } }
            );
            res.status(200).json({
              message: "logged in successfully",
              success: true,
              encryptedId: jwtToken,
              isPremium: data[0].dataValues.isPremium,
            });
          }
          if (!result) {
            if (inputCredentials.email === databaseCredentials.email) {
              res
                .status(401)
                .json({ message: "password mismatch", success: false });
            } else {
              res.status(404).json({ message: "User not found" });
            }
          }
        }
      );
    }
  } catch (error) {
    res.status(500).json({ error: "Error occured while logging In" });
  }
};
