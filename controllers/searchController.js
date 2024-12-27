//Search form
const searchform = (req, res) => {
  res.render("searchform");
};

//Search controller with pagination
const Member = require("../models/memberModel");

/**
 * Handles paginated and sorted search requests for members.
 * Supports search by name, member ID, member grade, interests, DOB (year and month), and member card issue date.
 * @param {Request} req
 * @param {Response} res
 */
const search = async (req, res) => {
  try {
    // Extract query, field, page, and sort direction from the request
    const { query, field, page = 1, sort = "asc" } = req.query;

    // Validate the search input
    if (!query || !field) {
      return res.status(400).send("Search query and field are required.");
    }

    const pageSize = 20; // Number of results per page
    const currentPage = parseInt(page, 10) || 1; // Default to page 1 if not provided
    const skip = (currentPage - 1) * pageSize; // Calculate the number of documents to skip

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

      case "school":
        filter.school = { $regex: query, $options: "i" }; // Case-insensitive partial match
        break;

      case "township":
        filter.township = { $regex: query, $options: "i" }; // Case-insensitive partial match
        break;

      case "interests":
        filter.interests = { $regex: query, $options: "i" }; // Case-insensitive partial match
        break;

      case "dob": {
        // Parse query for year and month (format: YYYY-MM)
        const [year, month] = query.split("-").map(Number);
        if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
          return res.status(400).send("Invalid DOB format. Use YYYY-MM.");
        }
        filter.dob = {
          $gte: new Date(year, month - 1, 1), // Start of the month
          $lt: new Date(year, month, 1), // Start of the next month
        };
        break;
      }

      case "member_card_issue_date": {
        // Parse query for year and month (format: YYYY-MM)
        const [year, month] = query.split("-").map(Number);
        if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
          return res
            .status(400)
            .send("Invalid Member Card Issue Date format. Use YYYY-MM.");
        }
        filter.member_card_issue_date = {
          $gte: new Date(year, month - 1, 1), // Start of the month
          $lt: new Date(year, month, 1), // Start of the next month
        };
        break;
      }

      case "card_expiration_date": {
        // Parse query for year and month (format: YYYY-MM)
        const [year, month] = query.split("-").map(Number);
        if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
          return res
            .status(400)
            .send("Invalid Member Card Expiration Date format. Use YYYY-MM.");
        }
        filter.card_expiration_date = {
          $gte: new Date(year, month - 1, 1), // Start of the month
          $lt: new Date(year, month, 1), // Start of the next month
        };
        break;
      }

      default:
        return res.status(400).send("Invalid search field.");
    }

    // Set sorting order for `member_id`
    const sortOrder = sort === "desc" ? -1 : 1;

    // Fetch total count of matching documents
    const totalCount = await Member.countDocuments(filter);

    // Query the database for paginated and sorted results
    const members = await Member.find(filter)
      .sort({ member_id: sortOrder }) // Sort by `member_id` in the desired order
      .skip(skip)
      .limit(pageSize)
      .lean();

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / pageSize);

    // Render the results using an EJS template
    res.render("searchresults", {
      members,
      query,
      field,
      currentPage,
      totalPages,
      totalCount,
      sort, // Include sort direction for UI updates
    });
  } catch (err) {
    console.error("Error in search controller:", err);
    res.status(500).send("An error occurred while searching members.");
  }
};

module.exports = { search };

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
        //res.redirect("/api/search/searchform"); // Redirect to the main page or search results
        //res.end("ok");
        res.render("ok");
        res.end();
      });
    } else {
      // Save updates if no new file was uploaded
      await member.save();
      //res.redirect("/api/search/searchform");
      //res.redirect("/");
      //res.sendFile("../views/ok.html");
      res.render("ok");
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
