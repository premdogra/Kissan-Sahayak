const PricePrediction = require("../models/PricePrediction");

exports.createPrediction = async (req, res) => {
  const prediction = await PricePrediction.create(req.body);
  res.json(prediction);
};

exports.getPrediction = async (req, res) => {
  const { crop, district } = req.query;

  const prediction = await PricePrediction.findOne({ crop, district }).sort({ generatedAt: -1 });
  res.json(prediction);
};