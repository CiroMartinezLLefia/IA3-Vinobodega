const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    default: ""
  },
  type: {
    type: String,
    enum: ["vino", "cerveza"],
    required: true
  },
  graduacio: {
    type: Number,
    required: true
  },
  subType: {
    type: String, // e.g., "Negre", "Criança", "IPA", "Lager", "Pilsner"
    required: true
  },
  origin: {
    type: String, // e.g., "Penedès", "Rioja", "Bèlgica", "Irlanda"
    required: true
  },
  stock: {
    type: Number,
    default: 10
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Product", ProductSchema);
