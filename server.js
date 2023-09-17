const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const sequelize = require("./Utilities/database");

const User = require("./Models/userModel");

const loginRoutes = require("./Routes/loginRoutes");
const userRoutes = require("./Routes/userRoutes");

const app = express();
app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://127.0.0.1:5500",
    credentials: true,
  })
);

app.use("/users", loginRoutes);
app.use("/user", userRoutes);

sequelize
  .sync({ alter: true })
  .then((response) => {
    const port = process.env.PORT;
    console.log(`Starting server on ----------> port: ${port}`);
    app.listen(port);
  })
  .catch((error) => {
    console.log(error);
    console.log("Error Starting / Syncing the server");
  });
