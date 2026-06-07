const jwt = require("jsonwebtoken");
const User = require("../models/User");
const fallbackStore = require("../models/fallbackStore");
const { isDbConnected } = require("../db");

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_vinacoteca_key_2026";

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Accés denegat: Falta el token d'autenticació" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    let user;

    if (isDbConnected()) {
      user = await User.findById(decoded.id).select("-password");
    } else {
      user = fallbackStore.findUserById(decoded.id);
      if (user) {
        // Exclude password from request object
        const { password, ...userWithoutPassword } = user;
        user = userWithoutPassword;
      }
    }

    if (!user) {
      return res.status(401).json({ error: "Usuari no trobat o token no vàlid" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth token error:", error);
    return res.status(401).json({ error: "Sessió caducada o token invàlid" });
  }
};

const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Usuari no autenticat" });
    }

    const hasRole = allowedRoles.includes(req.user.role);
    if (!hasRole) {
      return res.status(403).json({ error: "Accés denegat: Permisos insuficients per a aquesta operació" });
    }

    next();
  };
};

module.exports = { authenticateToken, requireRole };
