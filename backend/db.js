const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("⚠️ ALERTA: La variable MONGODB_URI no està definida a l'entorn.");
    console.warn("⚠️ L'API Express funcionarà amb emmagatzematge en memòria (local/JSON).");
    isConnected = false;
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000 // fail fast if no local mongo is running
    });
    console.log(`🔌 Connectat correctament a MongoDB: ${conn.connection.host}`);
    isConnected = true;
    return conn;
  } catch (error) {
    console.error("❌ Error de connexió a MongoDB:", error.message);
    console.warn("⚠️ L'API Express arrencarà però farà caiguda segura cap a emmagatzematge en memòria.");
    isConnected = false;
    return null;
  }
};

const isDbConnected = () => {
  return isConnected && mongoose.connection.readyState === 1;
};

module.exports = { connectDB, isDbConnected };
