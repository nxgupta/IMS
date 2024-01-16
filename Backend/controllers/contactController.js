const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const sendEmail = require("../Utils/sendEmail");

const contactUs = asyncHandler(async (req, res) => {
  let { subject, message } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(400);
    throw new Error("User not found, Please sign up");
  }

  if (!subject || !message) {
    res.status(400);
    throw new Error("Please add Subject & Message");
  }
  const sentTo = process.env.EMAIL_USER;
  const sendFrom = process.env.EMAIL_USER;
  const replyTo = user.email;
  try {
    await sendEmail(subject, message, sentTo, sendFrom, replyTo);
    res.status(200);
    res.json({
      success: true,
      message: "Thank you for contacting Us, will get back to you soon",
    });
  } catch (error) {
    res.status(500);
    throw new Error("Email not sent please try again");
  }
});

module.exports = {
  contactUs,
};
