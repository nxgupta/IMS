let mongoose = require("mongoose");
let tokenSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "user",
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Set the default value to the current date and time
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

let Token = new mongoose.model("token", tokenSchema);
module.exports = Token;
