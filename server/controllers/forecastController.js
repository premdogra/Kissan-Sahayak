// controllers/forecastController.js
const aiService = require("../services/aiService");

const getForecast = async (req, res) => {
  try {
    const { commodity, state, district } = req.body || {};
    if (!commodity || !state || !district) {
      return res.status(400).json({ error: "commodity, state and district are required" });
    }
    const data = await aiService.getForecast({ commodity, state, district });
    res.status(200).json(data);
  } catch (error) {
    const status = error.response?.status || 500;
    res.status(status).json({ error: error.response?.data?.detail || error.message });
  }
};

const getRecommendation = async (req, res) => {
  try {
    const { commodity, state, district } = req.body || {};
    if (!commodity || !state || !district) {
      return res.status(400).json({ error: "commodity, state and district are required" });
    }
    const data = await aiService.getRecommendation({ commodity, state, district });
    res.status(200).json(data);
  } catch (error) {
    const status = error.response?.status || 500;
    res.status(status).json({ error: error.response?.data?.detail || error.message });
  }
};

const getPredictionGraph = async (req, res) => {
  try {
    const { commodity, state, district } = req.body || {};
    if (!commodity || !state || !district) {
      return res.status(400).json({ error: "commodity, state and district are required" });
    }
    const data = await aiService.getPredictionGraph({ commodity, state, district });
    res.status(200).json(data);
  } catch (error) {
    const status = error.response?.status || 500;
    res.status(status).json({ error: error.response?.data?.detail || error.message });
  }
};

const trainModels = async (req, res) => {
  try {
    const { commodity, state, district } = req.body || {};
    if (!commodity || !state || !district) {
      return res.status(400).json({ error: "commodity, state and district are required" });
    }
    const data = await aiService.trainModels({ commodity, state, district });
    res.status(200).json(data);
  } catch (error) {
    const status = error.response?.status || 500;
    res.status(status).json({ error: error.response?.data?.detail || error.message });
  }
};

module.exports = { getForecast, getRecommendation, getPredictionGraph, trainModels };