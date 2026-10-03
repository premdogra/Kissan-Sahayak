const SellingQueue = require("../models/SellingQueue");

exports.createQueue = async (req, res) => {
  const queue = await SellingQueue.create(req.body);
  res.json(queue);
};

exports.getQueue = async (req, res) => {
  const { crop, mandiName } = req.query;

  const queue = await SellingQueue.findOne({ crop, mandiName });
  res.json(queue);
};