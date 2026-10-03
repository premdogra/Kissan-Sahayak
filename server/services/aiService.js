// services/aiService.js
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const { AI_SERVICE_URL } = require("../config/aiService");

// ─── Chatbot ──────────────────────────────────────────────────────────────────

const getChatHealth = async () => {
  const { data } = await axios.get(`${AI_SERVICE_URL}/chat/health`);
  return data;
};

const sendChatMessage = async ({ messages, language, include_voice, include_forecast, include_nearby }) => {
  const { data } = await axios.post(`${AI_SERVICE_URL}/chat`, {
    messages,
    language: language ?? "auto",
    include_voice: include_voice ?? false,
    include_forecast: include_forecast ?? true,
    include_nearby: include_nearby ?? true,
  });
  return data;
};

const sendVoiceMessage = async (filePath, originalName, mimetype, language, include_voice) => {
  const form = new FormData();
  form.append("audio", fs.createReadStream(filePath), {
    filename: originalName || "recording.wav",
    contentType: mimetype || "audio/wav",
  });
  if (language) form.append("language", language);
  if (include_voice) form.append("include_voice", String(include_voice));

  const { data } = await axios.post(`${AI_SERVICE_URL}/chat/voice`, form, {
    headers: form.getHeaders(),
  });
  return data;
};

// ─── Forecast & Recommendation ───────────────────────────────────────────────

const getForecast = async ({ commodity, state, district }) => {
  const { data } = await axios.post(`${AI_SERVICE_URL}/forecast`, { commodity, state, district });
  return data;
};

const getRecommendation = async ({ commodity, state, district }) => {
  const { data } = await axios.post(`${AI_SERVICE_URL}/recommendation`, { commodity, state, district });
  return data;
};

const getPredictionGraph = async ({ commodity, state, district }) => {
  const { data } = await axios.post(`${AI_SERVICE_URL}/prediction-graph`, { commodity, state, district });
  return data;
};

// ─── Mandi Comparison ────────────────────────────────────────────────────────

const getMandiComparison = async ({ commodity, state, district, transport_cost }) => {
  const { data } = await axios.post(`${AI_SERVICE_URL}/mandi-comparison`, {
    commodity,
    state,
    district,
    transport_cost: transport_cost ?? 50,
  });
  return data;
};

// ─── Mandi Prices ────────────────────────────────────────────────────────────

const getMandiPrice = async ({ market, commodity, state, district }) => {
  const { data } = await axios.get(`${AI_SERVICE_URL}/mandi-price`, {
    params: { market, commodity, state, district },
  });
  return data;
};

const getNearbyMandis = async ({ lat, lon }) => {
  const { data } = await axios.get(`${AI_SERVICE_URL}/nearby-mandis`, {
    params: { lat, lon },
  });
  return data;
};

const getNearbyMandiPrices = async ({ lat, lon, commodity }) => {
  const { data } = await axios.get(`${AI_SERVICE_URL}/nearby-mandi-prices`, {
    params: { lat, lon, commodity },
  });
  return data;
};

// ─── Mandi History ───────────────────────────────────────────────────────────

const getMandiHistory = async ({ market, commodity }) => {
  const { data } = await axios.get(`${AI_SERVICE_URL}/mandi-history`, {
    params: { market, commodity },
  });
  return data;
};

const getMandiHistoryGraphStream = async ({ market, commodity }) => {
  const response = await axios.get(`${AI_SERVICE_URL}/mandi-history-graph`, {
    params: { market, commodity },
    responseType: "stream",
  });
  return response.data;
};

// ─── Model Training ──────────────────────────────────────────────────────────

const trainModels = async ({ commodity, state, district }) => {
  const { data } = await axios.post(`${AI_SERVICE_URL}/train-models`, { commodity, state, district });
  return data;
};

module.exports = {
  getChatHealth,
  sendChatMessage,
  sendVoiceMessage,
  getForecast,
  getRecommendation,
  getPredictionGraph,
  getMandiComparison,
  getMandiPrice,
  getNearbyMandis,
  getNearbyMandiPrices,
  getMandiHistory,
  getMandiHistoryGraphStream,
  trainModels,
};