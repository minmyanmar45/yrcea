const dotenv = require("dotenv").config();

PORT = process.env.PORT;
HOST = process.env.HOST;
JWT_SECRET = process.env.JWT_SECRET;
DBURI = process.env.DBURI;

module.exports = {
  HOST,
  PORT,
  JWT_SECRET,
  DBURI,
};
