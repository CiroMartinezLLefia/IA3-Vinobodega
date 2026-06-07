const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const fallbackStore = require("../models/fallbackStore");
const { isDbConnected } = require("../db");
const upload = require("../middlewares/upload");
const { authenticateToken } = require("../middlewares/auth");

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_vinacoteca_key_2026";

// Helper to delete uploaded file in case of error
const cleanUpFile = (file) => {
  if (file && file.path) {
    const fs = require("fs");
    try {
      fs.unlinkSync(file.path);
    } catch (err) {
      console.error("Error unlinking file:", err);
    }
  }
};

// POST /api/auth/registro
// Handles multipart/form-data for profile picture upload
router.post("/registro", (req, res) => {
  upload.single("photo")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password) {
        cleanUpFile(req.file);
        return res.status(400).json({ error: "Els camps nom, email i contrasenya són obligatoris" });
      }

      // Check format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        cleanUpFile(req.file);
        return res.status(400).json({ error: "L'adreça de correu té un format invàlid" });
      }

      const relativePhotoPath = req.file ? `/uploads/${req.file.filename}` : "";

      // Check if user already exists
      if (isDbConnected()) {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
          cleanUpFile(req.file);
          return res.status(400).json({ error: "L'adreça de correu ja està registrada" });
        }

        const newUser = new User({
          name,
          email: email.toLowerCase(),
          password,
          photo: relativePhotoPath,
          role: role || "usuari" // default role
        });
        
        const savedUser = await newUser.save();
        return res.status(201).json({
          message: "Usuari registrat correctament",
          user: {
            id: savedUser._id,
            name: savedUser.name,
            email: savedUser.email,
            photo: savedUser.photo,
            role: savedUser.role
          }
        });
      } else {
        const existingUser = fallbackStore.findUserByEmail(email);
        if (existingUser) {
          cleanUpFile(req.file);
          return res.status(400).json({ error: "L'adreça de correu ja està registrada" });
        }

        const newUser = await fallbackStore.createUser({
          name,
          email,
          password,
          photo: relativePhotoPath,
          role: role || "usuari"
        });

        return res.status(201).json({
          message: "Usuari registrat correctament en memòria local",
          user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            photo: newUser.photo,
            role: newUser.role
          }
        });
      }
    } catch (error) {
      cleanUpFile(req.file);
      console.error("Registration error:", error);
      return res.status(500).json({ error: "Error intern del servidor" });
    }
  });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email i contrasenya obligatoris" });
    }

    let user;
    let isMatch = false;

    if (isDbConnected()) {
      user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        isMatch = await user.comparePassword(password);
      }
    } else {
      user = fallbackStore.findUserByEmail(email);
      if (user) {
        isMatch = await bcrypt.compare(password, user.password);
      }
    }

    if (!user || !isMatch) {
      return res.status(401).json({ error: "Credencials incorrectes" });
    }

    // Sign JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      message: "Login correcte",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        photo: user.photo,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Error intern del servidor" });
  }
});

// GET /api/auth/perfil (protected)
router.get("/perfil", authenticateToken, (req, res) => {
  return res.status(200).json(req.user);
});

// PUT /api/auth/perfil (protected)
// Updates profile data (name, optionally profile picture)
router.put("/perfil", authenticateToken, (req, res) => {
  upload.single("photo")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const { name } = req.body;
      const updates = {};
      
      if (name) updates.name = name;
      if (req.file) {
        updates.photo = `/uploads/${req.file.filename}`;
      }

      if (isDbConnected()) {
        const updatedUser = await User.findByIdAndUpdate(
          req.user._id,
          { $set: updates },
          { new: true }
        ).select("-password");

        if (!updatedUser) {
          cleanUpFile(req.file);
          return res.status(404).json({ error: "Usuari no trobat" });
        }
        return res.status(200).json(updatedUser);
      } else {
        const updatedUser = fallbackStore.updateUserProfile(req.user._id || req.user.id, updates);
        if (!updatedUser) {
          cleanUpFile(req.file);
          return res.status(404).json({ error: "Usuari no trobat" });
        }
        // remove password
        const { password, ...userWithoutPassword } = updatedUser;
        return res.status(200).json(userWithoutPassword);
      }
    } catch (error) {
      cleanUpFile(req.file);
      console.error("Profile update error:", error);
      return res.status(500).json({ error: "Error intern del servidor" });
    }
  });
});

module.exports = router;
