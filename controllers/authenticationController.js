const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { JWT_SECRET } = require("../config");

//Login
const checksession = (req, res) => {
  const token = req.cookies.token; // Read the token from cookies
  if (!token) {
    return res.status(401).json({ msg: "Unauthorized" }); // No token found
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ msg: "Invalid or expired token" }); // Invalid or expired token
    }

    // Token is valid; user is logged in
    return res.status(200).json({ msg: "User is logged in", user: decoded });
  });
};
//RegisterForm controller
const registerForm = (re, res) => {
  res.render("registerform");
};

const register = async (req, res) => {
  try {
    const { username, displayname, head, mobile, role, password } = req.body;

    // Server-side validation for username
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/; // Only alphanumeric and underscores, 3-20 characters
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        msg: "Username must be 3-20 characters long and can only contain letters, numbers, and underscores.",
      });
    }

    // Server-side validation for password
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        msg: "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the user
    const newUser = new User({
      username,
      displayname,
      head,
      mobile,
      role,
      password: hashedPassword,
    });
    await newUser.save();

    res.status(201).json({
      msg: `User is registered successfully with username: ${username} and display name: ${displayname}`,
    });
  } catch (err) {
    console.log(err);

    // Handle duplicate username error (if username must be unique)
    if (err.code === 11000 && err.keyPattern && err.keyPattern.username) {
      return res.status(400).json({
        msg: "Username is already taken. Please choose another username.",
      });
    }

    res.status(500).json({ msg: "Something went wrong" });
  }
};

//Login controller
const login = async (req, res) => {
  try {
    const { username, password } = await req.body;
    const user = await User.findOne({ username });
    //User validation
    if (!user) {
      console.log("user not found");
      return res.status(404).json({ msg: `user not found` });
    }
    //Compare password
    const passMath = await bcrypt.compare(password, user.password);
    if (!passMath) {
      console.log("invalid password");
      return res.status(400).json({ msg: `invalid password or credentials` });
    }
    //Create token
    const token = await jwt.sign(
      { id: user._id, head: user.head, role: user.role },
      JWT_SECRET,
      {
        expiresIn: "12h",
      }
    );

    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'sha256-7lRaFq9GnTuupW27lNy4JUcu0M7AhkQFytxm+D5R9gU=';"
    );

    //Set JWT in cookies
    res.cookie("token", token, {
      httpOnly: true, // Prevent access via JavaScript
      secure: false, // Set true in production (HTTPS)
      sameSite: "Strict",
      //maxAge: 3600000, // 1 hour
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    console.log("welcome");
    res.redirect("/api/auth/welcome");
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: `something went wrong` });
  }
};

//Welcome controller
const welcome = (req, res) => {
  res.render("welcome");
};

//Logout controller
const logout = (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
};

//Dashboard controller
/*
const dashboard = (req, res) => {
  try {
    User.find()
      .sort({ createdAt: 1 })
      .then((result) => {
        res.render("dashboard", { userlist: result });
      });
  } catch (err) {
    console.log(err);
  }
};
*/

// Dashboard controller with pagination
const dashboard = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page number
    const limit = parseInt(req.query.limit) || 5; // Number of users per page
    const skip = (page - 1) * limit; // Number of documents to skip

    // Fetch paginated users and the total count
    const [userlist, totalUsers] = await Promise.all([
      User.find().sort({ createdAt: 1 }).skip(skip).limit(limit),
      User.countDocuments(),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(totalUsers / limit);

    res.render("dashboard", { userlist, totalPages, currentPage: page });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

//Delete user controller
const deleteuser = async (req, res) => {
  try {
    const { username, id } = req.body;

    // Validate required input
    if (!username && !id) {
      return res.status(400).json({ msg: "Username and Id is required" });
    }

    // Find the user by username
    const user = await User.findOne({ username });
    const uid = user._id.toString();

    // Check if user exists and is eligible for deletion
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (user.username === "master" || user.head === "boss") {
      return res.status(403).json({ msg: "You cannot delete this user" });
    }

    // Delete the user
    await User.deleteOne({ username });
    return res.status(200).json({
      msg: `${username} has been deleted successfully.`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

//Reset password
const resetpassword = async (req, res) => {
  try {
    const { username, password, id, head, role } = req.body;
    // Find the user by username
    const user = await User.findOne({ username });
    const hashedPassword = await bcrypt.hash(password, 10);
    const uid = await user._id.toString();

    if (head === "boss" && role === "master") {
      await User.updateOne({ username }, { password: hashedPassword });
      return res.status(200).json(`${head} ${role}`);
    } else if (head === "manager" && role === "master") {
      await User.updateOne({ username }, { password: hashedPassword });
      return res.status(200).json(`${head} ${role}`);
    } else if (id === uid) {
      await User.updateOne({ username }, { password: hashedPassword });
      return res.status(200).json(`${head} ${role} ${uid}`);
    } else {
      return res.status(403).json(`access denied`);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

//Unauthorized
const unauthorized = (req, res) => {
  res.render("unauthorized");
};
//Exports modules
module.exports = {
  checksession,
  registerForm,
  register,
  login,
  welcome,
  logout,
  dashboard,
  deleteuser,
  resetpassword,
  unauthorized,
};
