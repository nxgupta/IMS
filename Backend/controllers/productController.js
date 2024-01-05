const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");

const dummy = asyncHandler(async (req, res) => {
  res.send("");
});
const createProduct = asyncHandler(async (req, res) => {
  let { name, sku, price, quantity, category, description } = req.body;
  if (!name || !sku || !price || !quantity || !category || !description) {
    res.status(400);
    throw new Error("Please fill all fields");
  }
  res.send("product created");
});

module.exports = {
  createProduct,
};
