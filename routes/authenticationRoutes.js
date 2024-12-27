const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyJWT");
//Controller
const {
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
} = require("../controllers/authenticationController");

//Authentication routes
router.get("/checksession", verifyJWT(["master", "admin"]), checksession);
router.get("/register", verifyJWT(["master", "admin"]), registerForm);
router.post("/register", register);
router.post("/login", login);
router.get("/welcome", verifyJWT(["master", "admin"]), welcome);
router.get("/logout", logout);
router.get("/dashboard", verifyJWT(["master", "admin"]), dashboard);
router.delete("/delete", verifyJWT(["master"]), deleteuser);
router.patch("/resetpassword", verifyJWT(["master", "admin"]), resetpassword);
router.get("/unauthorized", unauthorized);

module.exports = router;
