const { upload } = require("../Utils/fileUplaod");
const {
  createProduct,
  getProducts,
  getProduct,
  deleteProduct,
  updateProduct,
} = require("../controllers/productController");
const { protectUser } = require("../middlewares/authMiddleware");
const productRouter = require("express").Router();

productRouter
  .route("/")
  .post(protectUser, upload.single("file"), createProduct)
  .get(protectUser, getProducts);

productRouter
  .route("/:id")
  .get(protectUser, getProduct)
  .delete(protectUser, deleteProduct)
  .patch(protectUser, upload.single("file"), updateProduct);

module.exports = productRouter;
