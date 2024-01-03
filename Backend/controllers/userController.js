const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Token = require("../models/tokenModel");
const sendEmail = require("../Utils/sendEmail");

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
    const token = await jwt.sign({ id: _id }, process.env.JWT_SECRET, {
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

const getUser = asyncHandler(async (req, res) => {
  let user = req.user;
  if (user) {
    res.status(200).send(user);
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

const loginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    res.status(200).json(false);
  }
  let verified = jwt.verify(token, process.env.JWT_SECRET);
  if (verified) {
    res.status(200).json(true);
  } else {
    res.status(200).json(false);
  }
});
const updateUser = asyncHandler(async (req, res) => {
  let user = req.user;
  if (user) {
    const { name, email, photo, phone, bio } = user;
    user.email = email;
    user.name = req.body.name || name;
    user.bio = req.body.bio || bio;
    user.phone = req.body.phone || phone;
    user.photo = req.body.photo || photo;
  }

  const userUpdated = await user.save();
  if (userUpdated) {
    let { name, email, photo, phone, bio } = userUpdated;
    res.json({ name, email, bio, phone, photo });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const changePassword = asyncHandler(async (req, res) => {
  let user = req.user;
  let { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    res.status(400);
    throw new Error("Please enter old and new password");
  }
  const { password } = await getPassword(user._id);
  const isPasswordCorrect = await bcrypt.compare(oldPassword, password);
  if (isPasswordCorrect) {
    user.password = newPassword;
    await user.save();
    res.status(200).send("Password changed successfully");
  } else {
    res.status(404);
    throw new Error("Please enter valid old and new password");
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  let tokenExists = Token.findById({ userId: user._id });
  if (tokenExists) await Token.deleteOne({ userId: user._id });

  let resetToken = crypto.randomBytes(32).toString("hex") + user._id;
  const hashedToken = crypto
    .createHash("SHA256")
    .update(resetToken)
    .digest("hex");

  await new Token({
    userId: user._id,
    token: hashedToken,
    expiresAt: Date.now() + 30 * (60 * 1000),
  }).save();

  //Reset Url
  const resetUrl = `${process.env.FRONTEND_URL}/resetPassword/${resetToken}`;

  //Reset mail message
  const message = `<h2>Hellow ${user.name}</h2>
  <p>Please use the below url to reset your password</p>
  <p>This reset link is only valid for 30 minutes</p>
  
  <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
  
  <p>Regards-</p>
  <p>Inventory Insight</p>`;

  const subject = "Password reset request";
  const sentTo = user.email;
  const sendFrom = process.env.EMAIL_USER;
  try {
    await sendEmail(subject, message, sentTo, sendFrom);
    res.status(200);
    res.json({ success: true, message: "Reset email sent" });
  } catch (error) {
    res.status(500);
    throw new Error("Email not sent please try again");
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  let { password } = req.body;
  let { resetToken } = req.params;
  const hashedToken = crypto
    .createHash("SHA256")
    .update(resetToken)
    .digest("hex");
  let userToken = await Token.findOne({
    token: hashedToken,
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    res.status(404);
    throw new Error("Invalid or Expired Token");
  }

  const user = await User.findOne({ _id: userToken.userId });
  user.password = password;
  await user.save();
  res.status(200).json({
    message: "Password Reset Successful, Please login",
  });
});

async function getPassword(_id) {
  if (_id) {
    return await User.findById({ _id }, { password: 1, _id: 0 }).select(
      "+password"
    );
  }
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  loginStatus,
  updateUser,
  changePassword,
  forgotPassword,
  resetPassword,
};
