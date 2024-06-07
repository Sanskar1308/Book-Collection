const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  author: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Collection = mongoose.model("collection", collectionSchema);

module.exports = Collection;
