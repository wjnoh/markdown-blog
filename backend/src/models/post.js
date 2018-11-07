const mongoose = require("mongoose");

const { Schema } = mongoose;

// Post 스키마 생성
const Post = new Schema({
  title: String,
  body: String,
  tags: [String],
  publishedDate: {
    type: Date,
    default: new Date()
  }
});

module.exports = mongoose.model("Post", Post);
