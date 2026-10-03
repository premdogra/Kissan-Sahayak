// controllers/mandiController.js
const aiService = require("../services/aiService");

const getMandiComparison = async (req, res) => {
  try {
    const { commodity, state, district, transport_cost } = req.body || {};
    if (!commodity || !state || !district) {
      return res.status(400).json({ error: "commodity, state and district are required" });
    }
    const data = await aiService.getMandiComparison({ commodity, state, district, transport_cost });
    res.status(200).json(data);
  } catch (error) {
    const status = error.response?.status || 500;
    res.status(status).json({ error: error.response?.data?.detail || error.message });
  }
};

const getMandiPrice = async (req, res) => {
  try {
    const { market, commodity, state, district } = req.query;
    if (!market || !commodity) {
      return res.status(400).json({ error: "market and commodity are required" });
    }
    const data = await aiService.getMandiPrice({ market, commodity, state, district });
    res.status(200).json(data);
  } catch (error) {
    const status = error.response?.status || 500;
    res.status(status).json({ error: error.response?.data?.detail || error.message });
  }
};

const getNearbyMandis = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: "lat and lon are required" });
    }
    const data = await aiService.getNearbyMandis({ lat, lon });
    res.status(200).json(data);
  } catch (error) {
    const status = error.response?.status || 500;
    res.status(status).json({ error: error.response?.data?.detail || error.message });
  }
};

const getNearbyMandiPrices = async (req, res) => {
  try {
    const { lat, lon, commodity } = req.query;
    if (!lat || !lon || !commodity) {
      return res.status(400).json({ error: "lat, lon and commodity are required" });
    }
    const data = await aiService.getNearbyMandiPrices({ lat, lon, commodity });
    res.status(200).json(data);
  } catch (error) {
    const status = error.response?.status || 500;
    res.status(status).json({ error: error.response?.data?.detail || error.message });
  }
};

const getMandiHistory = async (req, res) => {
  try {
    const { market, commodity } = req.query;
    if (!market || !commodity) {
      return res.status(400).json({ error: "market and commodity are required" });
    }
    const data = await aiService.getMandiHistory({ market, commodity });
    res.status(200).json(data);
  } catch (error) {
    const status = error.response?.status || 500;
    res.status(status).json({ error: error.response?.data?.detail || error.message });
  }
};

const getMandiHistoryGraph = async (req, res) => {
  try {
    const { market, commodity } = req.query;
    if (!market || !commodity) {
      return res.status(400).json({ error: "market and commodity are required" });
    }
    const stream = await aiService.getMandiHistoryGraphStream({ market, commodity });
    res.setHeader("Content-Type", "image/png");
    stream.pipe(res);
  } catch (error) {
    const status = error.response?.status || 500;
    res.status(status).json({ error: error.response?.data?.detail || error.message });
  }
};

module.exports = {
  getMandiComparison,
  getMandiPrice,
  getNearbyMandis,
  getNearbyMandiPrices,
  getMandiHistory,
  getMandiHistoryGraph,
};