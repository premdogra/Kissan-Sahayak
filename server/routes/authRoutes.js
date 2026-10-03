const express = require("express");
const router = express.Router();

const {
  register,
  login,
  sendResetOTP,
  verifyOTPAndReset
} = require("../controllers/authController");

// Register user
router.post("/register", register);

// Login user
router.post("/login", login);

// Send OTP for forgot password
router.post("/forgot-password", sendResetOTP);

// Verify OTP and reset password
router.post("/reset-password", verifyOTPAndReset);

module.exports = router;