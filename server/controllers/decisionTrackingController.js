const DecisionTracking = require("../models/DecisionTracking");

exports.trackDecision = async (req, res) => {
  const decision = await DecisionTracking.create({
    ...req.body,
    userId: req.user.id,
  });

  res.json(decision);
};

exports.getUserHistory = async (req, res) => {
  const history = await DecisionTracking.find({ userId: req.user.id });
  res.json(history);
};