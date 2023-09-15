const User = require("../Models/userModel");
const bcrypt = require("bcrypt");

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
