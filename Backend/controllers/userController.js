const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body();
  if ((!name, !email, !password)) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }
  if (password.length > 23) {
    res.status(400);
    throw new Error("Password must be up to 23 characters");
  }
  let userExists = await User.find({ email });
  if (userExists) {
    res.status(400);
    throw new Error("Email has already been registered");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) res.status(200).json({ ...user });
});

module.exports = {
  registerUser: registerUser,
};
