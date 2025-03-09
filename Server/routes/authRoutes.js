import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.js";

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "Taskmanager", {
    expiresIn: "30d",
  });
};

// Register a new user
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  console.log("name", name);

  try {
    const userExists = await User.findOne({ email });
    console.log("userExists", userExists);
    if (userExists)
      return res.status(400).json({ error: "User already exists" });

    const user = new User({ name, email, password });
    await user.save();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.log("err", err);
    res.status(400).json({ error: err.message });
  }
});

// Login User
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ error: "Invalid email or password" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid email or password" });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
