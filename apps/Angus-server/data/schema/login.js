const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const user = new Schema({
  username: String | Number,
  password: String | Number,
  age: Number,
  pages: Array
});

const User = mongoose.model("User", user);

module.exports = User;
