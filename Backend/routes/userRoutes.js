const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  loginStatus,
  updateUser,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController");
const { protectUser } = require("../middlewares/authMiddleware");
const userRouter = express.Router();

userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/logout").get(logoutUser);
userRouter.route("/getUser").get(protectUser, getUser);
userRouter.route("/loginStatus").get(loginStatus);
userRouter.route("/updateUser").patch(protectUser, updateUser);
userRouter.route("/changePassword").patch(protectUser, changePassword);
userRouter.route("/forgotPassword").post(forgotPassword);
userRouter.route("/resetPassword/:resetToken").put(resetPassword);

module.exports = userRouter;
