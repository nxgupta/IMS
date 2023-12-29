const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  loginStatus,
  updateUser,
} = require("../controllers/userController");
const { protectUser } = require("../middlewares/authMiddleware");
const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
router.route("/getUser").get(protectUser, getUser);
router.route("/loginStatus").get(loginStatus);
router.route("/updateUser").patch(protectUser, updateUser);
module.exports = router;
