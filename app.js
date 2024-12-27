const express = require("express");
const { PORT, HOST, DBURI, JWT_SECRET } = require("./config");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const path = require("path");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const User = require("./models/userModel");

//Routes paths
const authenticationRoutes = require("./routes/authenticationRoutes");
const memberRoutes = require("./routes/memberRoutes");
const searchRoutes = require("./routes/searchRoutes");

//Middleware
const app = express();

//JSON COOKIE URLENCODED
app.use(express.json()); // for json
app.use(cookieParser()); // Enable reading cookies from requests
app.use(express.urlencoded({ extended: true })); // for form data

//Fileupload
app.use(fileUpload()); // Enable file upload middleware

//Public folders
app.use("/public", express.static(path.join(__dirname, "/public"))); // Public
app.use("/doc", express.static(path.join(__dirname, "/doc")));

//RENDER EJS
app.set("view engine", "ejs");

//Mongoose events
mongoose.connection.on("connected", () => console.log("db is conected"));
mongoose.connection.on("disconnected", () => console.log("db is disconected"));
mongoose.connection.on("error", (err) => console.log(err));

//DB connected and server setup
mongoose
  .connect(DBURI)
  .then((result) => {
    console.log(`database connected successfully`);
    console.log(
      `${result.connection.host}, ${result.connection.port} and ${result.connection.name}`
    );
    app.listen(PORT, HOST, (err) => {
      if (err) throw err;
      console.log(`App is running on ${HOST}:${PORT}`);
    });
  })
  .catch((err) => console.log(err));

//Default Admin account
const defaultAdm = async () => {
  try {
    const username = "admin";
    const displayname = "Administrator";
    const head = "boss";
    const mobile = "09123123123";
    const role = "master";
    const password = "password";
    const user = await User.findOne({ username });
    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        username,
        displayname,
        head,
        mobile,
        role,
        password: hashedPassword,
      });
      await newUser.save();
      console.log(`default admin user is created`);
    } else {
      console.log(`default admin user is already exist`);
    }
  } catch (err) {
    console.log(`something went wrong`);
  }
};

//Default manager account
const defaultMas = async () => {
  try {
    const username = "master";
    const displayname = "master";
    const head = "manager";
    const mobile = "09123123123";
    const role = "master";
    const password = "password";
    const user = await User.findOne({ username });
    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        username,
        displayname,
        head,
        mobile,
        role,
        password: hashedPassword,
      });
      await newUser.save();
      console.log(`default master user is created`);
    } else {
      console.log(`default master user is already exist`);
    }
  } catch (err) {
    console.log(`something went wrong`);
  }
};

//Call functions
defaultAdm();
defaultMas();

//Routes
app.get("/", (req, res) => res.render("index")); //home
app.use("/api/auth", authenticationRoutes); //authentoication
app.use("/api/member", memberRoutes);
app.use("/api/search", searchRoutes);

//Default route
app.use("*", (req, res) => res.render("unauthorized"));
