const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

const verifyJWT = (requiredRoles = []) => {
  return (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
      return res.redirect("/"); // Redirect to login if no token is found
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.render("unauthorized", {
          message: "Invalid or expired token",
        });
      }

      req.body = { ...req.body, ...user }; // Attach decoded user to request
      console.log(req.body);
      // Check if user's role is authorized
      if (requiredRoles.length && !requiredRoles.includes(req.body.role)) {
        return res.status(403).json({ msg: `access denied` });
      }

      next(); // Proceed to the next middleware or route
    });
  };
};

module.exports = verifyJWT;
