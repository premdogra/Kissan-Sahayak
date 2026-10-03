const mongoose = require("mongoose");

const bulkRequestSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    quantity: Number,
    proposedPrice: Number,

    negotiationHistory: [
      {
        price: Number,
        by: { type: String, enum: ["customer", "farmer"] },
        date: { type: Date, default: Date.now },
      },
    ],

    status: {
      type: String,
      enum: ["pending", "negotiating", "accepted", "rejected"],
      default: "pending",
    },

    finalPrice: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("BulkRequest", bulkRequestSchema);