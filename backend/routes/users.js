const express = require("express");
const router = express.Router();
const User = require("../models/User");
const fallbackStore = require("../models/fallbackStore");
const { isDbConnected } = require("../db");
const { authenticateToken, requireRole } = require("../middlewares/auth");

// GET /api/usuaris
// Protected (admin only) - gets all registered users
router.get("/", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    if (isDbConnected()) {
      const users = await User.find().select("-password").sort({ createdAt: -1 });
      return res.status(200).json(users);
    } else {
      const users = fallbackStore.getUsers();
      // Remove passwords
      const sanitizedUsers = users.map(({ password, ...userWithoutPassword }) => userWithoutPassword);
      return res.status(200).json(sanitizedUsers);
    }
  } catch (error) {
    console.error("Error listing users:", error);
    return res.status(500).json({ error: "Error intern del servidor" });
  }
});

// PATCH /api/usuaris/:id/rol
// Protected (admin only) - updates a user's role
router.patch("/:id/rol", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !["usuari", "editor", "admin"].includes(role)) {
      return res.status(400).json({ error: "Rol no permès. Ha de ser 'usuari', 'editor' o 'admin'" });
    }

    if (isDbConnected()) {
      const mongoose = require("mongoose");
      if (!mongoose.Types.ObjectId.isValid(id)) {
        const updated = fallbackStore.updateUserRole(id, role);
        if (updated) {
          const { password, ...sanitized } = updated;
          return res.status(200).json({
            message: "Rol actualitzat correctament",
            user: sanitized
          });
        }
        return res.status(404).json({ error: "Usuari no trobat" });
      }

      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: { role } },
        { new: true }
      ).select("-password");

      if (!updatedUser) {
        return res.status(404).json({ error: "Usuari no trobat" });
      }

      return res.status(200).json({
        message: "Rol actualitzat correctament",
        user: updatedUser
      });
    } else {
      const updatedUser = fallbackStore.updateUserRole(id, role);
      if (!updatedUser) {
        return res.status(404).json({ error: "Usuari no trobat" });
      }
      
      const { password, ...sanitized } = updatedUser;
      return res.status(200).json({
        message: "Rol actualitzat correctament (local)",
        user: sanitized
      });
    }
  } catch (error) {
    console.error("Error changing user role:", error);
    return res.status(500).json({ error: "Error intern del servidor" });
  }
});

module.exports = router;
