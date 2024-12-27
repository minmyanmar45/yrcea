const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyJWT");
//Controller
const {
  memberform,
  addmember,
  memberlist,
  memberdetail,
  memberverify,
} = require("../controllers/memberControllers");

//Member routes
router.get("/memberform", verifyJWT(["master", "admin"]), memberform);
router.post("/addmember", verifyJWT(["master", "admin"]), addmember);
router.get("/memberlist", verifyJWT(["master", "admin"]), memberlist);
router.get("/memberdetail/:id", verifyJWT(["master", "admin"]), memberdetail);
router.get("/memberverify/:id", memberverify);

module.exports = router;
