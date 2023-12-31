const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const protectUser = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.status(401);
      throw new Error("Not authorized, please login");
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    let user = await User.findById(verified.id).select("-password");
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    req.user = user;
    next();
  } catch (err) {
    throw new Error("Not authorized, please login");
  }
});

module.exports = {
  protectUser,
};
