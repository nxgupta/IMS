const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
const errorHandler = require("./middlewares/errorMiddleware");
const cookieParser = require("cookie-parser");
const productRoutes = require("./routes/productRoutes");

let port = process.env.PORT || 5000;
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use(errorHandler);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() =>
    app.listen(port, () => console.log("server listening at ", port))
  );
