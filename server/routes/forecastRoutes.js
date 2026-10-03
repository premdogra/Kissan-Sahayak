// routes/forecastRoutes.js
const express = require("express");
const router = express.Router();
const forecastController = require("../controllers/forecastController");

// POST /api/forecast              - Get 7-day price forecast
router.post("/", forecastController.getForecast);

// POST /api/forecast/recommendation - Get sell recommendation
router.post("/recommendation", forecastController.getRecommendation);

// POST /api/forecast/graph          - Generate prediction graph
router.post("/graph", forecastController.getPredictionGraph);

// POST /api/forecast/train          - Train XGBoost models
router.post("/train", forecastController.trainModels);

module.exports = router;