const mongoose = require("mongoose");

const farmerProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  storageDays: Number,
  financialUrgency: {
    type: String,
    enum: ["7_days", "15_days", "30_days"],
  },
  riskTolerance: {
    type: String,
    enum: ["low", "medium", "high"],
  },

  preferredMandis: [String],
  cropSpecialization: [String],
});

module.exports = mongoose.model("FarmerProfile", farmerProfileSchema);