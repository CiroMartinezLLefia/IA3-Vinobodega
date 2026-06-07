const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const fallbackStore = require("../models/fallbackStore");
const { isDbConnected } = require("../db");
const { authenticateToken } = require("../middlewares/auth");
const { sendOrderNotification } = require("../utils/mailer");

// POST /api/comandes
// Protected - user creates an order
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { items } = req.body; // array of { product: "id", quantity: 2 }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "La comanda ha de contenir com a mínim un producte" });
    }

    let resolvedItems = [];
    let totalPrice = 0;

    // Phase 1: Validate all items and stock availability
    if (isDbConnected()) {
      for (const item of items) {
        if (!item.product || !item.quantity || item.quantity <= 0) {
          return res.status(400).json({ error: "Dades d'ítem de comanda invàlides" });
        }

        const dbProduct = await Product.findById(item.product);
        if (!dbProduct) {
          return res.status(400).json({ error: `Producte amb ID ${item.product} no trobat` });
        }

        if (dbProduct.stock < item.quantity) {
          return res.status(400).json({ error: `Estoc insuficient per al producte ${dbProduct.name}. Estoc disponible: ${dbProduct.stock}` });
        }

        totalPrice += dbProduct.price * item.quantity;
        resolvedItems.push({
          product: dbProduct._id,
          productName: dbProduct.name, // for email formatting
          quantity: item.quantity,
          price: dbProduct.price
        });
      }

      // Phase 2: Deduct stock and save order
      for (const item of resolvedItems) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
      }

      const newOrder = new Order({
        user: req.user._id,
        items: resolvedItems,
        totalPrice
      });

      const savedOrder = await newOrder.save();

      // Trigger email sending asynchronously
      // Details of user are in req.user
      sendOrderNotification(savedOrder, req.user);

      return res.status(201).json({
        message: "Comanda creada correctament",
        order: savedOrder
      });
    } else {
      // Fallback local persistence
      for (const item of items) {
        if (!item.product || !item.quantity || item.quantity <= 0) {
          return res.status(400).json({ error: "Dades d'ítem de comanda invàlides" });
        }

        const dbProduct = fallbackStore.findProductById(item.product);
        if (!dbProduct) {
          return res.status(400).json({ error: `Producte no trobat` });
        }

        if (dbProduct.stock < item.quantity) {
          return res.status(400).json({ error: `Estoc insuficient per al producte ${dbProduct.name}. Estoc disponible: ${dbProduct.stock}` });
        }

        totalPrice += dbProduct.price * item.quantity;
        resolvedItems.push({
          product: dbProduct._id,
          productName: dbProduct.name,
          quantity: item.quantity,
          price: dbProduct.price
        });
      }

      // Deduct stock in fallback
      for (const item of resolvedItems) {
        fallbackStore.updateProduct(item.product, {
          stock: fallbackStore.findProductById(item.product).stock - item.quantity
        });
      }

      const savedOrder = fallbackStore.createOrder({
        user: req.user._id || req.user.id,
        items: resolvedItems,
        totalPrice
      });

      // Send mail notification
      sendOrderNotification(savedOrder, req.user);

      return res.status(201).json({
        message: "Comanda creada correctament (local)",
        order: savedOrder
      });
    }
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ error: "Error intern del servidor" });
  }
});

// GET /api/comandes/me
// Protected - gets logged-in user orders
router.get("/me", authenticateToken, async (req, res) => {
  try {
    if (isDbConnected()) {
      const orders = await Order.find({ user: req.user._id })
        .populate("items.product")
        .sort({ createdAt: -1 });

      return res.status(200).json(orders);
    } else {
      const orders = fallbackStore.getOrdersByUser(req.user._id || req.user.id);
      return res.status(200).json(orders);
    }
  } catch (error) {
    console.error("Error retrieving user orders:", error);
    return res.status(500).json({ error: "Error intern del servidor" });
  }
});

module.exports = router;
