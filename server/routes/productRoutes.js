// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createProduct,
  getAllProducts,
  getFarmerProducts,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

router.get("/", protect, getAllProducts);     // customers browse all
router.get("/my", protect, getFarmerProducts);  // ✅ farmer sees own listings
router.post("/create", protect, createProduct);
router.put("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);

module.exports = router;