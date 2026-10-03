const express = require("express");
const router = express.Router();
const { createComparison, getComparison } = require("../controllers/mandiComparisonController");

router.post("/", createComparison);
router.get("/", getComparison);

module.exports = router;