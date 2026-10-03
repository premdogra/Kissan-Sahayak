// controllers/productController.js
const Product = require("../models/Product");

// POST /api/products/create — Farmer lists a crop
exports.createProduct = async (req, res) => {
  try {
    const { name, pricePerKg, quantityAvailable, description, variety, organic } = req.body;

    if (!name || !pricePerKg || !quantityAvailable) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const product = await Product.create({
      farmer: req.user.id,
      name,
      pricePerKg,
      quantityAvailable,
      description,
      variety,
      organic,
    });

    const populated = await Product.findById(product._id).populate("farmer", "name district state");
    res.status(201).json(populated);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/products — Marketplace: customers see all, farmers see others only
// ✅ FIXED: farmers were seeing their own listings in marketplace
exports.getAllProducts = async (req, res) => {
  try {
    const filter = req.user.role === "farmer"
      ? { farmer: { $ne: req.user.id } }  // Farmer: exclude own listings
      : {};                                 // Customer: see everything

    const products = await Product.find(filter)
      .populate("farmer", "name district state")
      .sort({ createdAt: -1 });

    res.json(products);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/products/my — Farmer sees only their own listings
exports.getFarmerProducts = async (req, res) => {
  try {
    const products = await Product.find({ farmer: req.user.id })
      .sort({ createdAt: -1 });
    res.json(products);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/products/:id — Update own product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.farmer.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    Object.assign(product, req.body);
    await product.save();
    res.json(product);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/products/:id — Delete own product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.farmer.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    await product.deleteOne();
    res.json({ message: "Product deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};