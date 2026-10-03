const express = require("express");
const router = express.Router();
const { addMandiPrice, getMandiPrices } = require("../controllers/mandiPriceController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRole } = require("../middleware/roleMiddleware");

router.post("/", protect, authorizeRole("admin"), addMandiPrice);
router.get("/", getMandiPrices);

module.exports = router;