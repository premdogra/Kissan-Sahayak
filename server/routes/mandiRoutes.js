// routes/mandiRoutes.js
const express = require("express");
const router = express.Router();
const mandiController = require("../controllers/mandiController");

// POST /api/mandi/comparison          - Compare mandis for best price
router.post("/comparison", mandiController.getMandiComparison);

// GET  /api/mandi/price?market=&commodity=&state=&district=
router.get("/price", mandiController.getMandiPrice);

// GET  /api/mandi/nearby?lat=&lon=
router.get("/nearby", mandiController.getNearbyMandis);

// GET  /api/mandi/nearby-prices?lat=&lon=&commodity=
router.get("/nearby-prices", mandiController.getNearbyMandiPrices);

// GET  /api/mandi/history?market=&commodity=
router.get("/history", mandiController.getMandiHistory);

// GET  /api/mandi/history-graph?market=&commodity=  (returns PNG image)
router.get("/history-graph", mandiController.getMandiHistoryGraph);

module.exports = router;