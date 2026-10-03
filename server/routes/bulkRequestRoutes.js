// routes/bulkRequestRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createRequest,
  getMyRequests,       // ✅ NEW — was missing
  respondByFarmer,
  respondByCustomer,
  getAllRequests,
} = require("../controllers/bulkRequestController");

// ✅ GET /api/bulk-requests — fetch requests for logged-in user (farmer or customer)
router.get("/", protect, getMyRequests);

router.post("/create", protect, createRequest);
router.put("/farmer/:id", protect, respondByFarmer);
router.put("/customer/:id", protect, respondByCustomer);
router.get("/all", protect, getAllRequests);  // admin/debug

module.exports = router;
