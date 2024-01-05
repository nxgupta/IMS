const { createProduct } = require("../controllers/productController");
const { protectUser } = require("../middlewares/authMiddleware");
const productRouter = require("express").Router();

productRouter.route("/").post(protectUser, createProduct);

module.exports = productRouter;
