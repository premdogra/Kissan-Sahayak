// models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: String,
    variety: String,
    pricePerKg: Number,
    quantityAvailable: Number,
    description: String,
    organic: Boolean,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);