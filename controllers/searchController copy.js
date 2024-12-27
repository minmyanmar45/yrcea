//Search form
const searchform = (req, res) => {
  res.render("searchform");
};

//Search controller
const Member = require("../models/memberModel");
/**
 * Handles search requests for members.
 * Supports search by name, member ID, member grade, or interests.
 * @param {Request} req
 * @param {Response} res
 */
const search = async (req, res) => {
  try {
    // Extract query and field from the request
    const { query, field } = req.query;

    // Validate the search input
    if (!query || !field) {
      return res.status(400).send("Search query and field are required.");
    }

    // Create a filter object for MongoDB
    let filter = {};
    switch (field) {
      case "name":
        filter.name = { $regex: query, $options: "i" }; // Case-insensitive partial match
        break;

      case "member_id":
        filter.member_id = { $regex: `^${query}`, $options: "i" }; // Starts with match
        break;

      case "memberGrade":
        filter.memberGrade = { $regex: query, $options: "i" }; // Case-insensitive match
        break;

      case "interests":
        filter.interests = { $regex: query, $options: "i" }; // Case-insensitive partial match
        break;

      default:
        return res.status(400).send("Invalid search field.");
    }

    // Query the database for matching members
    const members = await Member.find(filter).lean(); // Use `.lean()` for faster rendering in EJS

    // Render the results using an EJS template
    res.render("searchresults", { members, query, field });
  } catch (err) {
    console.error("Error in searchMembers controller:", err);
    res.status(500).send("An error occurred while searching members.");
  }
};

//Edit controller
const editmemberform = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).send("Member not found");
    }
    res.render("editmemberform", { member });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

//Edit member controllers
const path = require("path");
const fs = require("fs");

const editmember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).send("Member not found");
    }

    // Update grade and points
    member.memberGrade = req.body.memberGrade;
    member.memberPoints = req.body.memberPoints;

    // Handle file upload
    if (req.files && req.files.icon_file) {
      const iconFile = req.files.icon_file;

      // Validate file type (optional)
      const allowedExtensions = /jpeg|jpg|png|gif|ico/;
      const fileExtension = path.extname(iconFile.name).toLowerCase();
      if (!allowedExtensions.test(fileExtension)) {
        return res
          .status(400)
          .send("Invalid file type. Please upload an image file.");
      }

      // Generate unique filename
      const uniqueFileName = `${Date.now()}${fileExtension}`;

      // Define upload path
      const uploadPath = path.join(__dirname, "../doc/icons", uniqueFileName);

      // Move file to the uploads directory
      iconFile.mv(uploadPath, async (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send("File upload failed");
        }

        // Delete old file if it exists
        if (member.icon_file) {
          const oldFilePath = path.join(
            __dirname,
            "../doc/icons",
            member.icon_file
          );
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }

        // Update the member's icon file path
        member.icon_file = `/doc/icons/${uniqueFileName}`;

        // Save the updated member data
        await member.save();
        res.redirect("/api/search/searchform"); // Redirect to the main page or search results
        res.end();
      });
    } else {
      // Save updates if no new file was uploaded
      await member.save();
      //res.redirect("/");
      res.end();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

//Exports controllers
module.exports = {
  searchform,
  search,
  editmemberform,
  editmember,
};
