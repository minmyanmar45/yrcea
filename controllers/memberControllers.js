//Member form registration
const memberform = (req, res) => {
  res.render("memberform");
};

//Adding member
const Member = require("../models/memberModel");
const fs = require("fs");
const path = require("path");

//Add member
const addmember = async (req, res) => {
  try {
    const {
      member_grade,
      member_points,

      member_id,
      name,
      gender,
      dob,
      father_name,
      age,
      nrc_no,
      phone,
      email,
      township,
      division,
      address,
      school,
      class: school_class,
      school_address,
      education,
      degree1,
      degree_date1,
      institution1,
      degree2,
      degree_date2,
      institution2,
      degree3,
      degree_date3,
      institution3,
      position,
      department,
      company,
      interests,
      join_interest,
      approve_person_name,
      member_card_issue_date,
      card_expiration_date,
    } = req.body;

    // MemberGrade and Points
    let memberGrade = req.body.member_grade[0]; // Extract the first value
    let memberPoints = Number(req.body.member_points[0]); // Convert the first value to a number
    // Prepare degrees array
    const degrees = [
      { degree: degree1, degree_date: degree_date1, institution: institution1 },
      { degree: degree2, degree_date: degree_date2, institution: institution2 },
      { degree: degree3, degree_date: degree_date3, institution: institution3 },
    ].filter((degree) => degree.degree); // Filter out empty degree entries

    // Ensure uploads directory exists
    const uploadDir1 = path.join(__dirname, "../doc/uploads");
    if (!fs.existsSync(uploadDir1)) {
      fs.mkdirSync(uploadDir1, { recursive: true });
    }
    const uploadDir2 = path.join(__dirname, "../doc/photos");
    if (!fs.existsSync(uploadDir2)) {
      fs.mkdirSync(uploadDir2, { recursive: true });
    }
    const uploadDir3 = path.join(__dirname, "../doc/icons");
    if (!fs.existsSync(uploadDir3)) {
      fs.mkdirSync(uploadDir3, { recursive: true });
    }

    let pdfFilePath = null;
    let memberPhotoPath = null;
    let iconPhotoPath = null;

    // File upload handling for PDF
    if (req.files && req.files.pdf_file) {
      const pdfFile = req.files.pdf_file;
      const pdfFileName = `pdf_${Date.now()}${path.extname(pdfFile[0].name)}`;
      const pdfUploadPath = path.join(uploadDir1, pdfFileName);
      await pdfFile[0].mv(pdfUploadPath);
      pdfFilePath = `/doc/uploads/${pdfFileName}`; // Store relative path
    } else {
      return res.status(400).send({ message: "PDF file is required." });
    }

    // File upload handling for Member Photo
    if (req.files && req.files.member_photo) {
      const memberPhoto = req.files.member_photo;
      const photoFileName = `photo_${Date.now()}${path.extname(
        memberPhoto[0].name
      )}`;
      const photoUploadPath = path.join(uploadDir2, photoFileName);
      await memberPhoto[0].mv(photoUploadPath);
      memberPhotoPath = `/doc/photos/${photoFileName}`; // Store relative path
    } else {
      return res.status(400).send({ message: "Member photo is required." });
    }

    // File upload handling for Icon Photo
    if (req.files && req.files.icon_upload) {
      const iconPhoto = req.files.icon_upload;
      const iconFileName = `icon_${Date.now()}${path.extname(
        iconPhoto[0].name
      )}`;
      const iconUploadPath = path.join(uploadDir3, iconFileName);
      await iconPhoto[0].mv(iconUploadPath);
      iconPhotoPath = `/doc/icons/${iconFileName}`; // Store relative path
    } else {
      return res.status(400).send({ message: "Icon photo is required." });
    }

    // Create a new member object
    const newMember = new Member({
      member_photo: memberPhotoPath,
      memberGrade,
      memberPoints,
      icon_file: iconPhotoPath,
      member_id,
      name,
      gender,
      dob,
      father_name,
      age,
      nrc_no,
      phone,
      email,
      township,
      division,
      address,
      school,
      class: school_class,
      school_address,
      education,
      degrees,
      position,
      department,
      company,
      interests,
      join_interest,
      approve_person_name,
      member_card_issue_date,
      card_expiration_date,
      pdf_file: pdfFilePath, // Save PDF file path
    });

    // Save to MongoDB
    await newMember.save();
    res.status(201).json({ message: "Member saved successfully!" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error saving member data", error });
  }
};

//Member list controller
const memberlist = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const limit = 3; // Number of members per page
    const skip = (page - 1) * limit; // Number of documents to skip

    // Fetch total count for pagination metadata
    const totalMembers = await Member.countDocuments();

    // Fetch members with sorting and pagination
    const members = await Member.find()
      .sort({ member_id: 1 }) // Sort by name alphabetically
      .skip(skip) // Skip members for previous pages
      .limit(limit); // Limit to 50 members per page

    // Calculate total pages
    const totalPages = Math.ceil(totalMembers / limit);

    // Render the member list EJS with pagination data
    res.render("memberlist", {
      members,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching paginated members:", error);
    res.status(500).send("Internal Server Error");
  }
};

//Member detail controller
const memberdetail = async (req, res) => {
  try {
    const id = req.params.id;

    // Fetch the member from MongoDB using the `member_id` field
    const member = await Member.findOne({ _id: id });

    if (!member) {
      return res.status(404).send("Member not found");
    }

    // Render the member detail EJS page
    res.render("memberdetail", { member });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

//Member detail controller
const memberverify = async (req, res) => {
  try {
    const id = req.params.id;

    // Fetch the member from MongoDB using the `member_id` field
    const member = await Member.findOne({ _id: id });

    if (!member) {
      return res.status(404).send("Member not found");
    }

    // Render the member detail EJS page
    res.render("memberverify", { member });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

//Exports controllers
module.exports = {
  memberform,
  addmember,
  memberlist,
  memberdetail,
  memberverify,
};
