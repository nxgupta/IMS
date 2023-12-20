const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();
let port = process.env.PORT || 5000;
const app = express();

app.get("/home", (req, res) => {
  res.status(200).send("<header>Hi Frontend</header>");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() =>
    app.listen(port, () => console.log("server listening at ", port))
  );
