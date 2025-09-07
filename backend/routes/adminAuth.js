const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Admin Register
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      emailId,
      password,
      phoneno,
      city,
      state,
      country,
      bio,
      image,
    } = req.body;
    if (
      !name ||
      !emailId ||
      !password ||
      !phoneno ||
      !city ||
      !state ||
      !country
    ) {
      return res
        .status(400)
        .json({
          message:
            "Required fields: name, email, password, phone, city, state, country",
        });
    }

    // Check if admin with this email already exists
    const existingAdminEmail = await User.findOne({ emailId, role: "admin" });
    if (existingAdminEmail) {
      return res
        .status(409)
        .json({ message: "Admin with this email already exists." });
    }

    // Check if user with this phone number already exists
    const existingPhone = await User.findOne({ phoneno });
    if (existingPhone) {
      return res
        .status(409)
        .json({ message: "User with this phone number already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new User({
      name,
      emailId,
      password: hashedPassword,
      phoneno,
      city,
      state,
      country,
      bio: bio || "",
      image: image || "",
      role: "admin",
    });
    await admin.save();
    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_KEY,
      { expiresIn: "7d" }
    );
    res.status(201).json({
      message: "Admin registered successfully.",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        emailId: admin.emailId,
        phoneno: admin.phoneno,
        city: admin.city,
        state: admin.state,
        country: admin.country,
        bio: admin.bio,
        image: admin.image,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("Admin registration error:", err); // Add detailed logging
    res.status(500).json({
      message: "Server error.",
      error: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
});

// Admin Login
router.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    if (!emailId || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const admin = await User.findOne({
      emailId,
      role: { $in: ["admin", "superadmin"] },
    });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_KEY,
      { expiresIn: "7d" }
    );
    res.status(200).json({
      message: "Admin logged in successfully.",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        emailId: admin.emailId,
        role: admin.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-password");
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// Get all admins
router.get("/admins", async (req, res) => {
  try {
    const admins = await User.find({
      role: { $in: ["admin", "superadmin"] },
    }).select("-password");
    res.status(200).json({ admins });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

module.exports = router;
