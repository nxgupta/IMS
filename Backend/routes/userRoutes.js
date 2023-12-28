const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
} = require("../controllers/userController");
const { protectGetUser } = require("../middlewares/authMiddleware");
const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
router.route("/getUser").get(protectGetUser, getUser);
module.exports = router;
