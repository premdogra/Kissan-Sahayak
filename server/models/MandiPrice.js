const mongoose = require("mongoose");

const mandiPriceSchema = new mongoose.Schema({
  crop: String,
  mandiName: String,
  district: String,
  state: String,

  date: Date,

  modalPrice: Number,
  minPrice: Number,
  maxPrice: Number,

  arrivalQuantity: Number,
  rainfall: Number,
  temperature: Number,

  source: String,
});

module.exports = mongoose.model("MandiPrice", mandiPriceSchema);