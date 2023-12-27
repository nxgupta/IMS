const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
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
  let userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("Email has already been registered");
  }

  const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
  };

  const userCreated = await User.create({
    name,
    email,
    password,
  });

  //Generate Token
  const token = generateToken(userCreated._id);

  //send HTTP-only cookie
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 24 * 60 * 60),
    sameSite: "none",
    secure: true,
  });
  const user = await User.findById(userCreated._id).select("-password").lean();
  if (user) res.status(201).json({ ...user, token });
});

const loginUser = asyncHandler(async (req, res) => {
  let { email, password } = req.body;
  //validate Request
  if (!email || !password) {
    res.status(400);
    throw new Error("Please add email and password");
  }
  const user = await User.findOne({ email }).select("+password").lean();
  if (!user) {
    res.status(400);
    throw new Error("User not found, Please Sign Up!");
  }
  const passwordIsCorrect = await bcrypt.compare(password, user.password);
  if (passwordIsCorrect) {
    const { _id, name, email, photo, phone, bio } = user;
    const token = await jwt.sign({ _id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      sameSite: "none",
      secure: true,
    });
    res.status(200).json({ _id, name, email, photo, phone, bio });
  } else {
    res.status(400);
    throw new Error("Invalid email or password");
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    sameSite: true,
    secure: true,
  });
  res.status(200).json({
    msg: "user successfully logged out",
  });
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};
