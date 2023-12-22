const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const router = require("./routes/userRoutes");
const errorHandler = require("./middlewares/errorMiddleware");

let port = process.env.PORT || 5000;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/api/users", router);

app.get("/home", (req, res) => {
  res.status(200).send("<header>Hi Frontend</header>");
});

app.use(errorHandler);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() =>
    app.listen(port, () => console.log("server listening at ", port))
  );
