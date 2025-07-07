const mongoose = require("mongoose");
const schema = mongoose.Schema;
require("dotenv").config();
const MONGO_URL = process.env.MONGO_URI;
const connection = mongoose
  .connect(MONGO_URL)
  .then(console.log("db connected successfully"));

const User = new schema({
  username: String,
  password: String,
  email: { type: String, unique: true },
});

const TodoSchema = new mongoose.Schema({
  task: String,
  isDone: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const UserModel = mongoose.model("user", User);
const TodoModel = mongoose.model("todo", TodoSchema);

module.exports = { UserModel, TodoModel };
