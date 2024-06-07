const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    sparse: true,
  },
  password: {
    type: String,
  },
  token: {
    type: String,
  },
});

const User = mongoose.model("users", userSchema);

module.exports = User;
