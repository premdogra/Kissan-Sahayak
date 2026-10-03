const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");

const chatRoutes = require("./routes/chatRoutes");
const forecastRoutes = require("./routes/forecastRoutes");
const mandiRoutes = require("./routes/mandiRoutes");

const { errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();

// Connect database
connectDB();

const app = express();


// Middleware
app.use(cors({
  origin: "http://localhost:5173", // React frontend
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Root Test Route
app.get("/", (req, res) => {
  res.send("MarketPulse API running 🚀");
});


// API Routes
app.use("/api/auth", require("./routes/authRoutes"));

// Enable when ready
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/bulk-requests", require("./routes/bulkRequestRoutes"));

// AI / chatbot services
app.use("/api/chat", chatRoutes);
app.use("/api/forecast", forecastRoutes);
app.use("/api/mandi", mandiRoutes);


// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});


// Global Error Handler
app.use(errorHandler);


// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);