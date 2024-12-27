const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    displayname: { type: String, required: true },

    head: { type: String, required: false, enum: ["boss", "manager", "staff"] },
    mobile: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["master", "admin"],
    },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const User = new mongoose.model("users", userSchema);
module.exports = User;

/*
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ["admin", "manager", "user"] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("webusers", userSchema);
*/
