const express = require("express");
const { protectUser } = require("../middlewares/authMiddleware");
const { contactUs } = require("../controllers/contactController");
const contactRouter = express.Router();

contactRouter.route("/").post(protectUser, contactUs);

module.exports = contactRouter;
