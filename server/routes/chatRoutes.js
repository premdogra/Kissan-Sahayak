// routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const chatController = require("../controllers/chatController");

const upload = multer({ dest: "uploads/" });

// GET  /api/chat/health       - Check chatbot availability
router.get("/health", chatController.getChatHealth);

// POST /api/chat              - Send text message
router.post("/", chatController.sendChatMessage);

// POST /api/chat/voice        - Send voice message (multipart/form-data)
router.post("/voice", upload.single("audio"), chatController.sendVoiceMessage);

module.exports = router;