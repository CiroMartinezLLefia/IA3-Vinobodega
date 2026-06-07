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
    
    // Seed database collections on boot
    await seedDatabase();
    
    return conn;
  } catch (error) {
    console.error("❌ Error de connexió a MongoDB:", error.message);
    console.warn("⚠️ L'API Express arrencarà però farà caiguda segura cap a emmagatzematge en memòria.");
    isConnected = false;
    return null;
  }
};

const seedDatabase = async () => {
  try {
    const Product = require("./models/Product");
    const User = require("./models/User");

    // Check products
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log("🌱 Base de dades buida. Sembrant productes de prova (vins i cerveses)...");
      const defaultProducts = [
        {
          name: "Tempranillo Reserva 2020",
          description: "Un vi negre elegant amb notes de fruita vermella madura i fusta de roure.",
          price: 18.50,
          image: "/uploads/tempranillo.jpg",
          type: "vino",
          graduacio: 14,
          subType: "Negre Criança",
          origin: "Rioja",
          stock: 15
        },
        {
          name: "Chardonnay Blanc 2022",
          description: "Vi blanc afruitat i fresc amb aromes de préssec i poma verde, molt equilibrat.",
          price: 14.20,
          image: "/uploads/chardonnay.jpg",
          type: "vino",
          graduacio: 12.5,
          subType: "Blanc Jove",
          origin: "Penedès",
          stock: 20
        },
        {
          name: "IPA Artesana La Brava",
          description: "Cervesa artesana estil India Pale Ale amb aromes cítriques intensos i un amargor característic.",
          price: 3.20,
          image: "/uploads/ipa.jpg",
          type: "cerveza",
          graduacio: 6.2,
          subType: "IPA",
          origin: "Catalunya",
          stock: 30
        },
        {
          name: "Belgian Strong Gold",
          description: "Cervesa belga d'alta graduació, de cos mitjà i maltosa, amb tocs d'espècies i fruita madura.",
          price: 4.50,
          image: "/uploads/belgian.jpg",
          type: "cerveza",
          graduacio: 8.5,
          subType: "Belgian Strong Ale",
          origin: "Bèlgica",
          stock: 25
        }
      ];
      await Product.insertMany(defaultProducts);
      console.log("🌱 Productes de prova sembrats correctament!");
    }

    // Check users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("🌱 Sembrant usuaris administradors i de proves...");
      const defaultUsers = [
        {
          name: "Anna Admin",
          email: "admin@vinacoteca.com",
          password: "123456",
          role: "admin",
          photo: ""
        },
        {
          name: "Joan Client",
          email: "client@vinacoteca.com",
          password: "123456",
          role: "usuari",
          photo: ""
        }
      ];
      // Save individually to trigger mongoose pre-save bcrypt hash hooks
      for (const u of defaultUsers) {
        const newUser = new User(u);
        await newUser.save();
      }
      console.log("🌱 Usuaris de proves sembrats correctament!");
    }
  } catch (err) {
    console.error("❌ Error de seeding en base de dades:", err.message);
  }
};

const isDbConnected = () => {
  return isConnected && mongoose.connection.readyState === 1;
};

module.exports = { connectDB, isDbConnected };
