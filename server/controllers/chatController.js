// controllers/chatController.js
const fs = require("fs");
const aiService = require("../services/aiService");

const getChatHealth = async (req, res) => {
  try {
    const data = await aiService.getChatHealth();
    res.status(200).json(data);
  } catch (error) {
    const status = error.response?.status || 500;
    res.status(status).json({ error: error.response?.data?.detail || error.message });
  }
};

const sendChatMessage = async (req, res) => {
  try {
    const { messages, language, include_voice, include_forecast, include_nearby } = req.body || {};

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array is required" });
    }

    const data = await aiService.sendChatMessage({
      messages,
      language,
      include_voice,
      include_forecast,
      include_nearby,
    });
    res.status(200).json(data);
  } catch (error) {
    const status = error.response?.status || 500;
    res.status(status).json({ error: error.response?.data?.detail || error.message });
  }
};

const sendVoiceMessage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Audio file is required" });
    }

    const { language, include_voice } = req.body;
    const data = await aiService.sendVoiceMessage(
      req.file.path,
      req.file.originalname,
      req.file.mimetype,
      language,
      include_voice
    );

    // Clean up temp file
    fs.unlink(req.file.path, () => { });
    res.status(200).json(data);
  } catch (error) {
    if (req.file) fs.unlink(req.file.path, () => { });
    const status = error.response?.status || 500;
    res.status(status).json({ error: error.response?.data?.detail || error.message });
  }
};

module.exports = { getChatHealth, sendChatMessage, sendVoiceMessage };