const mongoose = require("mongoose");

const mandiComparisonSchema = new mongoose.Schema({
  crop: String,
  userDistrict: String,

  mandis: [
    {
      mandiName: String,
      distanceKm: Number,
      transportCost: Number,
      currentPrice: Number,
      predictedPrice: Number,
      netExpectedProfit: Number,
    },
  ],

  suggestedMandis: [String],
  generatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("MandiComparison", mandiComparisonSchema);