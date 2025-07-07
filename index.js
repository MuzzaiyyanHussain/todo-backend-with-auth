const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const { UserModel, TodoModel } = require("./db");
const JWT = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const JWT_KEY = process.env.JWT_SECRET_KEY;

app.use(express.json());

app.post("/signup", async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
      return res
        .status(400)
        .json({ message: "Please fill all the details completely" });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await UserModel.create({ username, email, password: hashedPassword });

    return res.status(201).json({ message: "Signed up successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = JWT.sign({ id: user._id }, JWT_KEY, { expiresIn: "1h" });
    return res.json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

function authentication(req, res, next) {
  const token = req.headers.token;
  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    const decoded = JWT.verify(token, JWT_KEY);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
}

// Create Todo
app.post("/todo", authentication, async (req, res) => {
  try {
    const task = req.body.task;
    if (!task) {
      return res.status(400).json({ message: "Task is required" });
    }

    await TodoModel.create({ task, userId: req.userId });
    return res.json({ message: "Todo added successfully" });
  } catch (error) {
    console.error("Todo error:", error);
    return res.status(500).json({ message: "Error while adding the todo" });
  }
});

// Get Todos
app.get("/todos", authentication, async (req, res) => {
  try {
    const todos = await TodoModel.find({ userId: req.userId });
    return res.json({ todos });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
