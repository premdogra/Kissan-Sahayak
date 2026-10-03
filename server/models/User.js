const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,

    email: {
      type: String,
      unique: true,
      sparse: true   // allows null values
    },

    mobile: {
      type: String,
      unique: true,
      sparse: true
    },

    password: String,

    role: {
      type: String,
      enum: ["farmer", "customer", "admin"],
    },

    district: String,
    state: String,

    otp: String,
    otpExpire: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);