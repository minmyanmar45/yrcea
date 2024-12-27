const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  memberGrade: {
    type: String,
    enum: [
      "starter member",
      "bronze member",
      "silver member",
      "gold member",
      "platinum member",
      "diamond member",
    ],
    required: true,
  },
  memberPoints: { type: Number, required: true },
  icon_file: { type: String, required: true }, // Path to the uploaded icon file

  member_id: { type: String, required: true, unique: true }, // Member ID
  name: { type: String, required: true }, // Full Name
  gender: { type: String, enum: ["male", "female"], required: true }, // Gender
  dob: { type: Date, required: true }, // Date of Birth
  father_name: { type: String, required: true }, // Father's Name
  age: { type: Number, required: true }, // Age
  nrc_no: { type: String, required: true }, // NRC No
  phone: { type: String, required: true }, // Phone Number
  email: { type: String, required: true, unique: true }, // Email Address
  township: { type: String, required: true }, // Township
  division: { type: String, required: true }, // Division
  address: { type: String, required: true }, // Address

  // Student-specific fields
  school: { type: String }, // School/University
  class: { type: String }, // Class
  school_address: { type: String }, // School Address

  // Non-student-specific fields
  education: {
    type: String,
    enum: ["post-graduate", "graduate", "undergraduate"],
  }, // Education Level
  degrees: [
    {
      degree: { type: String }, // Degree Name
      degree_date: { type: Date }, // Date of Degree
      institution: { type: String }, // Institution Name
    },
  ], // Degrees Array

  position: { type: String }, // Current Employment Position
  department: { type: String }, // Current Employment Department
  company: { type: String }, // Current Employment Company

  // Area of Interest - Checkbox Values
  interests: [{ type: String }], // Array of interests like "ai", "gaming", etc.

  // Community Interest
  join_interest: {
    type: String,
    enum: ["sharing", "learning", "sharing and learning"],
  }, // Sharing/Learning/Both
  pdf_file: { type: String }, // Path to uploaded PDF file
  member_photo: { type: String }, // Path to uploaded PHOTO file

  // Approval Details
  approve_person_name: { type: String, required: true }, // Approving Person's Name
  member_card_issue_date: { type: Date, required: true }, // Member Card Issue Date
  card_expiration_date: { type: Date, required: true },
});

const Member = mongoose.model("Member", memberSchema);

module.exports = Member;
