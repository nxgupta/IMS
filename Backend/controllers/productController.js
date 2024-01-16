const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const { fileSizeFormatter } = require("../Utils/fileUplaod");
const cloudinary = require("cloudinary").v2;

const createProduct = asyncHandler(async (req, res) => {
  let { name, sku, price, quantity, category, description } = req.body;
  let fileData = {};
  if (req.file) {
    let uploadedFile;
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "IMS App",
        resource_type: "image",
      });
    } catch (error) {
      res.status(500);
      throw new Error("Image could not be uploaded");
    }
    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }
  if (!name || !sku || !price || !quantity || !category || !description) {
    res.status(400);
    throw new Error("Please fill all fields");
  }
  let product = await new Product({
    user: req.user.id,
    name,
    sku,
    price,
    quantity,
    category,
    description,
    image: fileData,
  }).save();
  res.status(201).json(product);
});
const getProduct = asyncHandler(async (req, res) => {
  let product = await Product.findOne({ _id: req.params.id });
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }
  res.status(200).json(product);
});
const getProducts = asyncHandler(async (req, res) => {
  let allProducts = await Product.find({ user: req.user.id }).sort({
    createdAt: -1,
  });
  if (!allProducts) {
    res.status(404);
    throw new Error("Products not found");
  }
  res.status(200).json(allProducts);
});
const deleteProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }
  await product.deleteOne();
  res.status(200).json({ message: "product deleted" });
});

const updateProduct = asyncHandler(async (req, res) => {
  let { name, price, quantity, category, description } = req.body;
  let { id } = req.params;
  let product = await Product.findById(id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  if (product.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }
  let fileData = {};
  if (req.file) {
    let uploadedFile;
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "IMS App",
        resource_type: "image",
      });
    } catch (error) {
      res.status(500);
      throw new Error("Image could not be uploaded");
    }
    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    {
      name,
      price,
      quantity,
      category,
      description,
      image: fileData.fileName || product.image,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(201).json(updatedProduct);
});

module.exports = {
  createProduct,
  getProduct,
  getProducts,
  deleteProduct,
  updateProduct,
};
