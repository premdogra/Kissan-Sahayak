const mongoose = require("mongoose");

const aiRecommendationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  crop: String,

  currentPrice: Number,
  predictedPeakPrice: Number,
  expectedIncreasePercent: Number,

  recommendation: {
    type: String,
    enum: ["Sell Now", "Wait"],
  },

  recommendedSellDate: Date,

  explanation: [String],

  confidenceScore: Number,
  adoptionRateAssumption: Number,

  generatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AIRecommendation", aiRecommendationSchema);