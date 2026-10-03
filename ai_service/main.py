# from fastapi import FastAPI, HTTPException
# from pydantic import BaseModel
# from datetime import datetime

# # AI modules
# from forecast_7_days import run_ai_forecast
# from mandi_comparison import compare_mandis
# from prediction_graph import generate_prediction_graph
# from recommendation_engine import generate_recommendation
# from nearby_mandis import get_nearby_mandis
# from mandi_price_service import get_mandi_price
# from mandi_history_service import get_last_7_mandi_prices

# app = FastAPI()

# # training
# from dataset_builder import build_training_dataset
# from train_xgb_market_models import train_market_models


# app = FastAPI(
#     title="MarketPulse AI Service",
#     description="AI microservice for crop price forecasting and mandi recommendation",
#     version="1.0"
# )


# # ---------------------------------------
# # Request Schemas
# # ---------------------------------------

# class ForecastRequest(BaseModel):
#     commodity: str
#     state: str
#     district: str


# class MandiRequest(BaseModel):
#     commodity: str
#     state: str
#     district: str
#     transport_cost: int = 50


# class RecommendationRequest(BaseModel):
#     commodity: str
#     state: str
#     district: str


# class TrainRequest(BaseModel):
#     commodity: str
#     state: str
#     district: str


# # ---------------------------------------
# # Root Route
# # ---------------------------------------

# @app.get("/")
# def root():
#     return {
#         "message": "MarketPulse AI Service Running 🚀",
#         "timestamp": datetime.now()
#     }


# # ---------------------------------------
# # Forecast + Recommendation
# # ---------------------------------------

# @app.post("/forecast")
# def forecast(data: ForecastRequest):

#     result = run_ai_forecast(
#         commodity=data.commodity,
#         state=data.state,
#         district=data.district
#     )

#     if "error" in result:
#         raise HTTPException(status_code=404, detail=result["error"])

#     return result


# # ---------------------------------------
# # Recommendation Engine Route
# # ---------------------------------------
# @app.post("/recommendation")
# def recommendation(data: RecommendationRequest):

#     result = run_ai_forecast(
#         commodity=data.commodity,
#         state=data.state,
#         district=data.district
#     )

#     if "error" in result:
#         raise HTTPException(status_code=404, detail=result["error"])

#     return result["recommendation"]


# # ---------------------------------------
# # Mandi Comparison
# # ---------------------------------------

# @app.post("/mandi-comparison")
# def mandi_comparison_route(data: MandiRequest):

#     result = compare_mandis(
#         commodity=data.commodity,
#         state=data.state,
#         district=data.district,
#         transport_cost=data.transport_cost
#     )

#     if "error" in result:
#         raise HTTPException(status_code=404, detail=result["error"])

#     return result


# # ---------------------------------------
# # Prediction Graph
# # ---------------------------------------

# @app.post("/prediction-graph")
# def prediction_graph(data: ForecastRequest):

#     generate_prediction_graph(
#         commodity=data.commodity,
#         state=data.state,
#         district=data.district
#     )

#     return {
#         "message": "Prediction graph generated successfully"
#     }


# # ---------------------------------------
# # Train Models
# # ---------------------------------------

# @app.post("/train-models")
# def train_models(data: TrainRequest):

#     dataset = build_training_dataset(
#         commodity=data.commodity,
#         state=data.state,
#         district=data.district,
#         include_market=True
#     )

#     if not dataset:
#         raise HTTPException(status_code=404, detail="No dataset found")

#     results = train_market_models(
#         dataset,
#         commodity=data.commodity,
#         district=data.district
#     )

#     return {
#         "message": "Model training completed",
#         "commodity": data.commodity,
#         "district": data.district,
#         "model_performance": results
#     }
# @app.get("/nearby-mandis")
# def nearby_mandis(lat: float, lon: float):

#     result = get_nearby_mandis(lat, lon)

#     return {
#         "nearby_mandis": result.to_dict(orient="records")
#     }

# from nearby_prices import get_nearby_mandi_prices

# @app.get("/nearby-mandi-prices")
# def nearby_prices(lat: float, lon: float, commodity: str):

#     result = get_nearby_mandi_prices(lat, lon, commodity)

#     return {
#         "commodity": commodity,
#         "nearby_prices": result
#     }

# @app.get("/mandi-price")
# def mandi_price(
#     market: str,
#     commodity: str,
#     state: str = None,
#     district: str = None
# ):

#     result = get_mandi_price(
#         market=market,
#         commodity=commodity,
#         state=state,
#         district=district
#     )

#     return result

# @app.get("/mandi-history")
# def mandi_history(market: str, commodity: str):

#     data = get_last_7_mandi_prices(market, commodity)

#     return {
#         "market": market,
#         "commodity": commodity,
#         "last_7_available_records": data
#     }
# from fastapi.responses import StreamingResponse
# from mandi_history_service_graph import generate_price_graph


# @app.get("/mandi-history-graph")
# def mandi_history_graph(market: str, commodity: str):

#     data = get_last_7_mandi_prices(market, commodity)

#     if not data:
#         return {"message": "No data available"}

#     graph = generate_price_graph(data, market, commodity)

#     return StreamingResponse(graph, media_type="image/png")

from fastapi import FastAPI, HTTPException, File, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse, HTMLResponse
from pydantic import BaseModel
from datetime import datetime
import os
import logging
from typing import Optional, List, Dict, Any
import json
# AI modules
from forecast_7_days import run_ai_forecast
from mandi_comparison import compare_mandis
from prediction_graph import generate_prediction_graph
from recommendation_engine import generate_recommendation
from nearby_mandis import get_nearby_mandis
from mandi_price_service import get_mandi_price
from mandi_history_service import get_last_7_mandi_prices
from mandi_history_service_graph import generate_price_graph
from nearby_prices import get_nearby_mandi_prices

# training
from dataset_builder import build_training_dataset
from train_xgb_market_models import train_market_models

# Sarvam AI Chatbot
from chatbot_service import ChatbotService
from dotenv import load_dotenv

load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="MarketPulse AI Service",
    description="AI microservice for crop price forecasting and mandi recommendation with multilingual chatbot support",
    version="2.0"
)

# Initialize chatbot service (will be None if API key not set)
try:
    chatbot_service = ChatbotService(api_key=os.getenv("SARVAM_API_KEY"))
    logger.info("✅ Chatbot service initialized successfully")
except Exception as e:
    chatbot_service = None
    logger.warning(f"⚠️ Chatbot service not initialized: {e}. Set SARVAM_API_KEY in .env to enable chatbot.")


# ---------------------------------------
# Request/Response Schemas
# ---------------------------------------

class ForecastRequest(BaseModel):
    commodity: str
    state: str
    district: str


class MandiRequest(BaseModel):
    commodity: str
    state: str
    district: str
    transport_cost: int = 50


class RecommendationRequest(BaseModel):
    commodity: str
    state: str
    district: str


class TrainRequest(BaseModel):
    commodity: str
    state: str
    district: str


# Chatbot Schemas
class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    language: str = "auto"  # auto, hi-IN, pa-IN, en-IN
    include_voice: bool = False
    include_forecast: bool = True
    include_nearby: bool = True


class ChatResponse(BaseModel):
    response: str
    audio: Optional[str] = None  # Base64 encoded audio
    detected_language: str
    forecast_data: Optional[Dict] = None
    nearby_mandis: Optional[List[Dict]] = None
    timestamp: datetime


# ---------------------------------------
# Root Route
# ---------------------------------------

@app.get("/")
def root():
    return {
        "message": "MarketPulse AI Service Running 🚀",
        "timestamp": datetime.now(),
        "chatbot_enabled": chatbot_service is not None
    }


# ---------------------------------------
# Chatbot Routes
# ---------------------------------------

@app.get("/chat/health")
def chat_health():
    """Check if chatbot is available"""
    if chatbot_service is None:
        return {
            "status": "unavailable",
            "message": "Chatbot service not initialized. Please set SARVAM_API_KEY in .env"
        }
    return {
        "status": "available",
        "languages": ["hi-IN (Hindi)", "pa-IN (Punjabi)", "en-IN (English)", "auto-detect"],
        "voices": chatbot_service.get_available_voices()
    }


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Multilingual chat endpoint for MarketPulse
    Supports English, Hindi, Punjabi and code-switching
    
    Example queries:
    - "ਬਠਿੰਡੇ ਵਿੱਚ ਕਣਕ ਦਾ ਕੀ ਭਾਵ ਹੈ?" (Punjabi)
    - "जम्मू में केले का क्या भाव है?" (Hindi)
    - "What is the price of tomatoes in Batote?" (English)
    - "Batote mein tomato ka price kya hai?" (Hinglish)
    """
    if chatbot_service is None:
        raise HTTPException(
            status_code=503, 
            detail="Chatbot service unavailable. Please contact administrator to set SARVAM_API_KEY"
        )
    
    try:
        # Convert messages to format expected by chatbot
        chat_messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
        
        # Get last user message for intent detection
        last_user_msg = next((msg.content for msg in reversed(request.messages) if msg.role == "user"), "")
        
        # Get chat response from Sarvam AI
        result = await chatbot_service.chat(
            messages=chat_messages,
            language=request.language,
            include_voice=request.include_voice,
            include_forecast=request.include_forecast,
            include_nearby=request.include_nearby,
            user_query=last_user_msg
        )
        
        return ChatResponse(
            response=result["response"],
            audio=result.get("audio"),
            detected_language=result["detected_language"],
            forecast_data=result.get("forecast_data"),
            nearby_mandis=result.get("nearby_mandis"),
            timestamp=datetime.now()
        )
        
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat/voice")
async def chat_voice(
    audio: UploadFile = File(...),
    language: str = "auto",
    include_voice: bool = True
):
    """
    Voice-based chat endpoint
    Upload audio file (wav/mp3) and get text + optional voice response
    """
    if chatbot_service is None:
        raise HTTPException(status_code=503, detail="Chatbot service unavailable")
    
    try:
        # Save uploaded file temporarily
        temp_file = f"temp_{audio.filename}"
        with open(temp_file, 'wb') as f:
            f.write(await audio.read())
        
        # Process voice input
        result = await chatbot_service.process_voice(
            audio_file=temp_file,
            language=language,
            include_voice=include_voice
        )
        
        # Clean up
        os.remove(temp_file)
        
        return result
        
    except Exception as e:
        logger.error(f"Voice chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.websocket("/chat/ws")
async def chat_websocket(websocket: WebSocket):
    """
    WebSocket endpoint for real-time chat
    Supports both text and voice (binary) messages
    """
    if chatbot_service is None:
        await websocket.close(code=1011, reason="Chatbot service unavailable")
        return
    
    await websocket.accept()
    
    try:
        while True:
            # Receive message (can be text or binary)
            message = await websocket.receive()
            
            if "text" in message:
                # Text message
                data = json.loads(message["text"])
                result = await chatbot_service.chat(
                    messages=data.get("messages", []),
                    language=data.get("language", "auto"),
                    include_voice=data.get("include_voice", False),
                    include_forecast=data.get("include_forecast", True),
                    include_nearby=data.get("include_nearby", True)
                )
                await websocket.send_json(result)
                
            elif "bytes" in message:
                # Voice message
                temp_file = "temp_ws_audio.wav"
                with open(temp_file, 'wb') as f:
                    f.write(message["bytes"])
                
                result = await chatbot_service.process_voice(
                    audio_file=temp_file,
                    language="auto",
                    include_voice=True
                )
                
                os.remove(temp_file)
                await websocket.send_json(result)
                
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.close(code=1011, reason=str(e))


# ---------------------------------------
# Existing Routes (Unchanged)
# ---------------------------------------

@app.post("/forecast")
def forecast(data: ForecastRequest):
    """Get price forecast for a commodity in a district"""
    result = run_ai_forecast(
        commodity=data.commodity,
        state=data.state,
        district=data.district
    )

    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])

    return result


@app.post("/recommendation")
def recommendation(data: RecommendationRequest):
    """Get selling recommendation based on forecast"""
    result = run_ai_forecast(
        commodity=data.commodity,
        state=data.state,
        district=data.district
    )

    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])

    return result["recommendation"]


@app.post("/mandi-comparison")
def mandi_comparison_route(data: MandiRequest):
    """Compare different mandis for best selling price"""
    result = compare_mandis(
        commodity=data.commodity,
        state=data.state,
        district=data.district,
        transport_cost=data.transport_cost
    )

    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])

    return result


@app.post("/prediction-graph")
def prediction_graph(data: ForecastRequest):
    """Generate prediction graph (returns file path)"""
    generate_prediction_graph(
        commodity=data.commodity,
        state=data.state,
        district=data.district
    )

    return {
        "message": "Prediction graph generated successfully"
    }


@app.post("/train-models")
def train_models(data: TrainRequest):
    """Train XGBoost models for markets"""
    dataset = build_training_dataset(
        commodity=data.commodity,
        state=data.state,
        district=data.district,
        include_market=True
    )

    if not dataset:
        raise HTTPException(status_code=404, detail="No dataset found")

    results = train_market_models(
        dataset,
        commodity=data.commodity,
        district=data.district
    )

    return {
        "message": "Model training completed",
        "commodity": data.commodity,
        "district": data.district,
        "model_performance": results
    }


@app.get("/nearby-mandis")
def nearby_mandis(lat: float, lon: float):
    """Get nearby mandis based on coordinates"""
    result = get_nearby_mandis(lat, lon)

    return {
        "nearby_mandis": result.to_dict(orient="records")
    }


@app.get("/nearby-mandi-prices")
def nearby_prices(lat: float, lon: float, commodity: str):
    """Get prices from nearby mandis"""
    result = get_nearby_mandi_prices(lat, lon, commodity)

    return {
        "commodity": commodity,
        "nearby_prices": result
    }


@app.get("/mandi-price")
def mandi_price(
    market: str,
    commodity: str,
    state: str = None,
    district: str = None
):
    """Get current price for a specific mandi"""
    result = get_mandi_price(
        market=market,
        commodity=commodity,
        state=state,
        district=district
    )

    return result


@app.get("/mandi-history")
def mandi_history(market: str, commodity: str):
    """Get historical price data for a mandi"""
    data = get_last_7_mandi_prices(market, commodity)

    return {
        "market": market,
        "commodity": commodity,
        "last_7_available_records": data
    }


@app.get("/mandi-history-graph")
def mandi_history_graph(market: str, commodity: str):
    """Get price trend graph for a mandi"""
    data = get_last_7_mandi_prices(market, commodity)

    if not data:
        return {"message": "No data available"}

    graph = generate_price_graph(data, market, commodity)

    return StreamingResponse(graph, media_type="image/png")


# ---------------------------------------
# Web Interface for Chatbot Testing
# ---------------------------------------

@app.get("/chat/interface", response_class=HTMLResponse)
async def chat_interface():
    """Simple web interface to test the chatbot"""
    if chatbot_service is None:
        return HTMLResponse(content="""
        <html>
            <body>
                <h1>Chatbot Unavailable</h1>
                <p>Please set SARVAM_API_KEY in .env file to enable chatbot.</p>
            </body>
        </html>
        """)
    
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>MarketPulse AI Chat - Punjabi, Hindi, English</title>
        <style>
            body { font-family: 'Segoe UI', Arial; max-width: 800px; margin: 0 auto; padding: 20px; }
            #chatbox { height: 400px; overflow-y: scroll; border: 1px solid #4CAF50; padding: 10px; margin-bottom: 10px; border-radius: 5px; }
            .user { color: #2196F3; margin: 5px 0; text-align: right; }
            .assistant { color: #4CAF50; margin: 5px 0; text-align: left; }
            .user span, .assistant span { display: inline-block; padding: 8px 12px; border-radius: 15px; max-width: 70%; }
            .user span { background-color: #E3F2FD; }
            .assistant span { background-color: #E8F5E9; }
            #controls { display: flex; gap: 10px; margin-bottom: 10px; }
            #message { flex: 1; padding: 10px; border: 2px solid #4CAF50; border-radius: 5px; font-size: 16px; }
            button { padding: 10px 20px; cursor: pointer; border: none; border-radius: 5px; font-size: 16px; }
            #sendBtn { background-color: #4CAF50; color: white; }
            #recordBtn { background-color: #f44336; color: white; }
            #recordBtn.recording { background-color: #d32f2f; animation: pulse 1s infinite; }
            @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; } }
            .controls-row { display: flex; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
            select, input[type="checkbox"] { padding: 8px; border: 2px solid #4CAF50; border-radius: 5px; }
            .language-select { flex: 1; }
            .status { color: #666; margin-top: 10px; font-style: italic; }
        </style>
    </head>
    <body>
        <h1>🌾 MarketPulse AI Assistant</h1>
        <p>Ask in Punjabi, Hindi, or English about mandi prices, forecasts, and recommendations</p>
        
        <div class="controls-row">
            <select id="language" class="language-select">
                <option value="auto">🌐 Auto-detect Language</option>
                <option value="hi-IN">🇮🇳 हिन्दी (Hindi)</option>
                <option value="pa-IN">🇮🇳 ਪੰਜਾਬੀ (Punjabi)</option>
                <option value="en-IN">🇬🇧 English</option>
            </select>
            <label>
                <input type="checkbox" id="voiceOutput" checked> 🔊 Voice Response
            </label>
            <label>
                <input type="checkbox" id="includeForecast" checked> 📊 Include Forecast
            </label>
        </div>
        
        <div id="chatbox"></div>
        
        <div id="controls">
            <input type="text" id="message" placeholder="Type your message... (e.g., 'ਬਠਿੰਡੇ ਵਿੱਚ ਕਣਕ ਦਾ ਭਾਵ?')">
            <button id="sendBtn" onclick="sendMessage()">Send</button>
            <button id="recordBtn" onclick="toggleRecording()">🎤 Record</button>
        </div>
        
        <div class="status" id="status"></div>
        
        <script>
            let mediaRecorder;
            let audioChunks = [];
            let isRecording = false;
            let chatHistory = [];
            
            function addMessage(text, sender) {
                const chatbox = document.getElementById('chatbox');
                const msgDiv = document.createElement('div');
                msgDiv.className = sender;
                
                const span = document.createElement('span');
                span.textContent = text;
                msgDiv.appendChild(span);
                
                chatbox.appendChild(msgDiv);
                chatbox.scrollTop = chatbox.scrollHeight;
                
                // Add to history
                chatHistory.push({role: sender, content: text});
            }
            
            async function sendMessage() {
                const message = document.getElementById('message').value;
                if (!message) return;
                
                const language = document.getElementById('language').value;
                const voiceOutput = document.getElementById('voiceOutput').checked;
                const includeForecast = document.getElementById('includeForecast').checked;
                
                addMessage(message, 'user');
                document.getElementById('message').value = '';
                document.getElementById('status').textContent = 'Thinking...';
                
                try {
                    const response = await fetch('/chat', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            messages: chatHistory.slice(-10), // Last 10 messages for context
                            language: language,
                            include_voice: voiceOutput,
                            include_forecast: includeForecast,
                            include_nearby: true
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                        addMessage(data.response, 'assistant');
                        document.getElementById('status').textContent = `Detected: ${data.detected_language}`;
                        
                        if (data.audio) {
                            const audio = new Audio('data:audio/wav;base64,' + data.audio);
                            audio.play();
                        }
                        
    
                        
                        if (data.nearby_mandis && data.nearby_mandis.length > 0) {
                            const nearbyText = '📍 Nearby mandis: ' + 
                                data.nearby_mandis.map(m => `${m.Market} (${m.distance_km.toFixed(1)}km)`).join(', ');
                            addMessage(nearbyText, 'assistant');
                        }
                    } else {
                        addMessage('Error: ' + data.detail, 'assistant');
                    }
                } catch (error) {
                    addMessage('Network error: ' + error, 'assistant');
                }
            }
            
            async function toggleRecording() {
                const recordBtn = document.getElementById('recordBtn');
                
                if (!isRecording) {
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        mediaRecorder = new MediaRecorder(stream);
                        audioChunks = [];
                        
                        mediaRecorder.ondataavailable = event => {
                            audioChunks.push(event.data);
                        };
                        
                        mediaRecorder.onstop = async () => {
                            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                            const formData = new FormData();
                            formData.append('audio', audioBlob, 'recording.wav');
                            formData.append('language', document.getElementById('language').value);
                            formData.append('include_voice', document.getElementById('voiceOutput').checked);
                            
                            document.getElementById('status').textContent = 'Processing voice...';
                            
                            try {
                                const response = await fetch('/chat/voice', {
                                    method: 'POST',
                                    body: formData
                                });
                                
                                const data = await response.json();
                                
                                if (response.ok) {
                                    addMessage(data.user_text, 'user');
                                    addMessage(data.response, 'assistant');
                                    
                                    if (data.audio) {
                                        const audio = new Audio('data:audio/wav;base64,' + data.audio);
                                        audio.play();
                                    }
                                }
                            } catch (error) {
                                addMessage('Voice processing error', 'assistant');
                            }
                            
                            stream.getTracks().forEach(track => track.stop());
                        };
                        
                        mediaRecorder.start();
                        isRecording = true;
                        recordBtn.textContent = '⏹ Stop';
                        recordBtn.classList.add('recording');
                        document.getElementById('status').textContent = 'Recording... Speak now';
                        
                    } catch (error) {
                        alert('Microphone access required for voice input');
                    }
                } else {
                    mediaRecorder.stop();
                    isRecording = false;
                    recordBtn.textContent = '🎤 Record';
                    recordBtn.classList.remove('recording');
                }
            }
            
            document.getElementById('message').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') sendMessage();
            });
            
            // Add welcome message
            window.onload = function() {
                addMessage('👋 Namaste! Sat Sri Akal! Hello! I can help you with mandi prices, forecasts, and recommendations. Ask me anything in Punjabi, Hindi, or English!', 'assistant');
            };
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)


# ---------------------------------------
# Health Check
# ---------------------------------------

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(),
        "services": {
            "chatbot": "available" if chatbot_service else "unavailable (set SARVAM_API_KEY)"
        }
    }