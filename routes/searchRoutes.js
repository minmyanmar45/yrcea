const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyJWT");
const {
  searchform,
  search,
  editmemberform,
  editmember,
} = require("../controllers/searchController");

//Search routes
router.get("/searchform", verifyJWT(["master", "admin"]), searchform);
router.get("/search", verifyJWT(["master", "admin"]), search);
router.get(
  "/editmemberform/:id",
  verifyJWT(["master", "admin"]),
  editmemberform
);
router.post("/editmember/:id", verifyJWT(["master", "admin"]), editmember);

//Exports routers
module.exports = router;
