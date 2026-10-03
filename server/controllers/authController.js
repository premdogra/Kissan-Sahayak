// const sendEmail = require("../utils/sendEmail");
// const User = require("../models/User");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// exports.register = async (req, res) => {
//   const { name, email, password, role } = req.body;

//   const exists = await User.findOne({ email });
//   if (exists) return res.status(400).json({ message: "User exists" });

//   const hashed = await bcrypt.hash(password, 10);

//   await User.create({ name, email, password: hashed, role });

//   res.json({ message: "Registered successfully" });
// };

// exports.login = async (req, res) => {
//   const { email, password } = req.body;

//   const user = await User.findOne({ email });
//   if (!user) return res.status(400).json({ message: "Invalid credentials" });

//   const match = await bcrypt.compare(password, user.password);
//   if (!match) return res.status(400).json({ message: "Invalid credentials" });

//   const token = jwt.sign(
//     { id: user._id, role: user.role },
//     process.env.JWT_SECRET,
//     { expiresIn: "1d" }
//   );

//   res.json({
//     token,
//     user: {
//       id: user._id,
//       role: user.role,
//       name: user.name,
//     },
//   });
// };
// exports.sendResetOTP = async (req, res) => {
//   try {
//     const { email } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();

//     user.otp = otp;
//     user.otpExpire = Date.now() + 5 * 60 * 1000; // 5 minutes

//     await user.save();

//     await sendEmail(
//       email,
//       "Password Reset OTP - MarketPulse",
//       `Your OTP for password reset is: ${otp}. It expires in 10 minutes.`
//     );

//     res.json({ message: "OTP sent to email successfully" });

//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
// exports.verifyOTPAndReset = async (req, res) => {
//   try {
//     const { email, otp, newPassword } = req.body;

//     const user = await User.findOne({
//       email,
//       otp,
//       otpExpire: { $gt: Date.now() },
//     });

//     if (!user) {
//       return res.status(400).json({ message: "Invalid or expired OTP" });
//     }

//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     user.password = hashedPassword;
//     user.otp = undefined;
//     user.otpExpire = undefined;

//     await user.save();

//     res.json({ message: "Password reset successful" });

//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

const sendEmail = require("../utils/sendEmail");
const sendSMS = require("../utils/sendSMS"); // optional if using SMS API
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// REGISTER
// exports.register = async (req, res) => {
//   const { name, email, mobile, password, role } = req.body;

//   const exists = await User.findOne({
//     $or: [{ email }, { mobile }]
//   });

//   if (exists) return res.status(400).json({ message: "User exists" });

//   const hashed = await bcrypt.hash(password, 10);

//   await User.create({ name, email, mobile, password: hashed, role });

//   res.json({ message: "Registered successfully" });
// };
// ✅ Fix
exports.register = async (req, res) => {
  try {
    const { name, email, mobile, password, role, state, district } = req.body;

    const exists = await User.findOne({ $or: [{ email }, { mobile }] });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    await User.create({ name, email, mobile, password: hashed, role, state, district });

    res.json({ message: "Registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// LOGIN (EMAIL OR MOBILE)
exports.login = async (req, res) => {
  const { identifier, password } = req.body;

  const user = await User.findOne({
    $or: [
      { email: identifier },
      { mobile: identifier }
    ]
  });

  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  // res.json({
  //   token,
  //   user: {
  //     id: user._id,
  //     role: user.role,
  //     name: user.name
  //   },
  // });
  res.json({
    token,
    user: {
      id: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      state: user.state,
      district: user.district,
    },
  });
};


// SEND RESET OTP (EMAIL OR MOBILE)
exports.sendResetOTP = async (req, res) => {
  try {

    const { identifier } = req.body;

    const user = await User.findOne({
      $or: [
        { email: identifier },
        { mobile: identifier }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpire = Date.now() + 5 * 60 * 1000;

    await user.save();

    // Send OTP via email
    if (identifier === user.email) {
      await sendEmail(
        user.email,
        "Password Reset OTP - MarketPulse",
        `Your OTP for password reset is: ${otp}. It expires in 5 minutes.`
      );
    }

    // Send OTP via mobile
    if (identifier === user.mobile) {

      if (sendSMS) {
        await sendSMS(user.mobile, otp);
      } else {
        console.log("OTP for mobile:", otp); // development mode
      }

    }

    res.json({ message: "OTP sent successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// VERIFY OTP AND RESET PASSWORD
exports.verifyOTPAndReset = async (req, res) => {
  try {

    const { identifier, otp, newPassword } = req.body;

    const user = await User.findOne({
      $or: [
        { email: identifier },
        { mobile: identifier }
      ],
      otp,
      otpExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpire = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};