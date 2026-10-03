const FarmerProfile = require("../models/FarmerProfile");

exports.createOrUpdateProfile = async (req, res) => {
  const { storageDays, financialUrgency, riskTolerance, preferredMandis, cropSpecialization } = req.body;

  const profile = await FarmerProfile.findOneAndUpdate(
    { userId: req.user.id },
    {
      storageDays,
      financialUrgency,
      riskTolerance,
      preferredMandis,
      cropSpecialization,
    },
    { new: true, upsert: true }
  );

  res.json(profile);
};

exports.getProfile = async (req, res) => {
  const profile = await FarmerProfile.findOne({ userId: req.user.id });
  res.json(profile);
};