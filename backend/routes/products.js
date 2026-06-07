const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const fallbackStore = require("../models/fallbackStore");
const { isDbConnected } = require("../db");
const { authenticateToken, requireRole } = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const { z } = require("zod");

const ProductInputSchema = z.object({
  name: z.string().min(2, "El nom ha de tenir almenys 2 caràcters"),
  description: z.string().min(5, "La descripció ha de tenir almenys 5 caràcters"),
  price: z.coerce.number().positive("El preu ha de ser positiu"),
  type: z.enum(["vino", "cerveza"], { errorMap: () => ({ message: "El tipus ha de ser 'vino' o 'cerveza'" }) }),
  graduacio: z.coerce.number().min(0, "La graduació no pot ser negativa"),
  subType: z.string().min(1, "El subtipus/estil és obligatori"),
  origin: z.string().min(1, "L'origen/regió és obligatori"),
  stock: z.coerce.number().int().min(0, "L'estoc no pot ser negatiu").default(10)
});

// GET /api/productes
// Public endpoint - lists all products
router.get("/", async (req, res) => {
  try {
    const { search, type, subType, origin } = req.query;

    if (isDbConnected()) {
      let query = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } }
        ];
      }
      if (type) query.type = type;
      if (subType) query.subType = subType;
      if (origin) query.origin = origin;

      const products = await Product.find(query).sort({ createdAt: -1 });
      return res.status(200).json(products);
    } else {
      let products = fallbackStore.getProducts();

      if (search) {
        const queryStr = search.toLowerCase();
        products = products.filter(p => 
          p.name.toLowerCase().includes(queryStr) || 
          p.description.toLowerCase().includes(queryStr)
        );
      }
      if (type) {
        products = products.filter(p => p.type === type);
      }
      if (subType) {
        products = products.filter(p => p.subType === subType);
      }
      if (origin) {
        products = products.filter(p => p.origin === origin);
      }

      // Sort by createdAt descending
      products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.status(200).json(products);
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({ error: "Error intern del servidor" });
  }
});

// GET /api/productes/:id
// Public endpoint - details of a single product
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const mongoose = require("mongoose");
      if (!mongoose.Types.ObjectId.isValid(id)) {
        // Fallback check in local memory just in case the id was hardcoded
        const localProduct = fallbackStore.findProductById(id);
        if (localProduct) return res.status(200).json(localProduct);
        return res.status(404).json({ error: "Producte no trobat" });
      }

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ error: "Producte no trobat" });
      }
      return res.status(200).json(product);
    } else {
      const product = fallbackStore.findProductById(id);
      if (!product) {
        return res.status(404).json({ error: "Producte no trobat" });
      }
      return res.status(200).json(product);
    }
  } catch (error) {
    console.error("Error fetching product details:", error);
    return res.status(500).json({ error: "Error intern del servidor" });
  }
});

// POST /api/productes
// Protected (editor/admin) - creates a product
router.post("/", authenticateToken, requireRole(["editor", "admin"]), (req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const parseResult = ProductInputSchema.safeParse(req.body);
      if (!parseResult.success) {
        if (req.file) {
          const fs = require("fs");
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          error: "Dades de producte invàlides",
          details: parseResult.error.flatten().fieldErrors
        });
      }

      const productData = parseResult.data;
      const relativeImagePath = req.file ? `/uploads/${req.file.filename}` : "";
      
      let newProduct;

      if (isDbConnected()) {
        newProduct = new Product({
          ...productData,
          image: relativeImagePath || "/uploads/placeholder.jpg" // default placeholder
        });
        const saved = await newProduct.save();
        return res.status(201).json(saved);
      } else {
        newProduct = fallbackStore.createProduct({
          ...productData,
          image: relativeImagePath || "/uploads/placeholder.jpg"
        });
        return res.status(201).json(newProduct);
      }
    } catch (error) {
      if (req.file) {
        const fs = require("fs");
        fs.unlinkSync(req.file.path);
      }
      console.error("Error creating product:", error);
      return res.status(500).json({ error: "Error intern del servidor" });
    }
  });
});

// PUT /api/productes/:id
// Protected (editor/admin) - updates a product
router.put("/:id", authenticateToken, requireRole(["editor", "admin"]), (req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const { id } = req.params;
      const parseResult = ProductInputSchema.partial().safeParse(req.body);
      
      if (!parseResult.success) {
        if (req.file) {
          const fs = require("fs");
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          error: "Dades de producte invàlides",
          details: parseResult.error.flatten().fieldErrors
        });
      }

      const updates = parseResult.data;
      if (req.file) {
        updates.image = `/uploads/${req.file.filename}`;
      }

      if (isDbConnected()) {
        const mongoose = require("mongoose");
        if (!mongoose.Types.ObjectId.isValid(id)) {
          // If it's a fallback ID
          const updated = fallbackStore.updateProduct(id, updates);
          if (updated) return res.status(200).json(updated);
          if (req.file) {
            const fs = require("fs");
            fs.unlinkSync(req.file.path);
          }
          return res.status(404).json({ error: "Producte no trobat" });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
          id,
          { $set: updates },
          { new: true }
        );

        if (!updatedProduct) {
          if (req.file) {
            const fs = require("fs");
            fs.unlinkSync(req.file.path);
          }
          return res.status(404).json({ error: "Producte no trobat" });
        }

        return res.status(200).json(updatedProduct);
      } else {
        const updatedProduct = fallbackStore.updateProduct(id, updates);
        if (!updatedProduct) {
          if (req.file) {
            const fs = require("fs");
            fs.unlinkSync(req.file.path);
          }
          return res.status(404).json({ error: "Producte no trobat" });
        }
        return res.status(200).json(updatedProduct);
      }
    } catch (error) {
      if (req.file) {
        const fs = require("fs");
        fs.unlinkSync(req.file.path);
      }
      console.error("Error updating product:", error);
      return res.status(500).json({ error: "Error intern del servidor" });
    }
  });
});

// DELETE /api/productes/:id
// Protected (editor/admin) - deletes a product
router.delete("/:id", authenticateToken, requireRole(["editor", "admin"]), async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const mongoose = require("mongoose");
      if (!mongoose.Types.ObjectId.isValid(id)) {
        const success = fallbackStore.deleteProduct(id);
        if (success) return res.status(204).send(); // no content
        return res.status(404).json({ error: "Producte no trobat" });
      }

      const deleted = await Product.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ error: "Producte no trobat" });
      }
      return res.status(204).send(); // 204 No Content
    } else {
      const success = fallbackStore.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ error: "Producte no trobat" });
      }
      return res.status(204).send(); // 204 No Content
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({ error: "Error intern del servidor" });
  }
});

module.exports = router;
