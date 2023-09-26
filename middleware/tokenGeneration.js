const jwt = require("jsonwebtoken");

exports.generateAutheticationToken = (data) => {
  const { id } = data;
  const secretKey = process.env.JWT_SECRET_KEY;
  const token = jwt.sign(id, secretKey);
  return token;
};
