const AIRecommendation = require("../models/AIRecommendation");

exports.createRecommendation = async (req, res) => {
  const recommendation = await AIRecommendation.create({
    ...req.body,
    userId: req.user.id,
  });

  res.json(recommendation);
};

exports.getUserRecommendations = async (req, res) => {
  const recs = await AIRecommendation.find({ userId: req.user.id });
  res.json(recs);
};