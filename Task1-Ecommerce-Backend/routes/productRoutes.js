const express = require("express");
const router = express.Router();
const Product = require("../models/productModel");
const mongoose = require("mongoose"); // <-- Add this line!

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single product by ID (safe for ObjectId vs string)
router.get("/:id", async (req, res) => {
  try {
    let product;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      // If ID is valid Mongo ObjectId, use findById
      product = await Product.findById(req.params.id);
    } else {
      // If not, try to find by string
      product = await Product.findOne({ _id: req.params.id });
    }
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
