const MandiPrice = require("../models/MandiPrice");

exports.addMandiPrice = async (req, res) => {
  const price = await MandiPrice.create(req.body);
  res.json(price);
};

exports.getMandiPrices = async (req, res) => {
  const { crop, district } = req.query;

  const prices = await MandiPrice.find({ crop, district });
  res.json(prices);
};