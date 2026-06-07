require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { connectDB } = require("./db");

// Routes imports
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const userRoutes = require("./routes/users");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Permet qualsevol origen de petició per evitar bloquejos de CORS acadèmics
    callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Request parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/productes", productRoutes);
app.use("/api/comandes", orderRoutes);
app.use("/api/usuaris", userRoutes);

// Root route details
app.get("/", (req, res) => {
  res.json({
    name: "Vinacoteca API REST",
    version: "1.0.0",
    status: "running",
    endpoints: {
      auth: "/api/auth",
      products: "/api/productes",
      orders: "/api/comandes",
      users: "/api/usuaris"
    }
  });
});

// 404 Route handler for unknown paths
app.use((req, res) => {
  res.status(404).json({ error: "Ruta de l'API no trobada" });
});

// Global error handler (handles Multer errors and uncaught exceptions)
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    error: err.message || "S'ha produït un error intern del servidor"
  });
});

// Bootstrap server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Servidor de la Vinacoteca API actiu al port ${PORT}`);
    console.log(`📡 CORS dinàmic actiu (permets peticions des de qualsevol origen)`);
  });
};

startServer();
