const MandiComparison = require("../models/MandiComparison");

exports.createComparison = async (req, res) => {
  const comparison = await MandiComparison.create(req.body);
  res.json(comparison);
};

exports.getComparison = async (req, res) => {
  const { crop, userDistrict } = req.query;

  const result = await MandiComparison.findOne({ crop, userDistrict }).sort({ generatedAt: -1 });
  res.json(result);
};