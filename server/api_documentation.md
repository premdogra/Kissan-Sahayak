# MarketPulse Express.js API Documentation

**Base URL:** `http://localhost:5000`  
**FastAPI Service:** `http://localhost:8000`  
**Version:** 1.0.0

---

## Table of Contents

1. [Chat Routes](#chat-routes)
2. [Forecast Routes](#forecast-routes)
3. [Mandi Routes](#mandi-routes)
4. [Error Responses](#error-responses)

---

## Chat Routes

Base path: `/api/chat`

---

### 1. GET `/api/chat/health`

Check if the chatbot service is available.

**Request:**

```
GET http://localhost:5000/api/chat/health
```

**Success Response `200`:**

```json
{
  "status": "available",
  "languages": [
    "hi-IN (Hindi)",
    "pa-IN (Punjabi)",
    "en-IN (English)",
    "auto-detect"
  ],
  "voices": {
    "hi-IN": { "female": "anushka", "male": "abhilash" },
    "pa-IN": { "female": "anushka", "male": "abhilash" },
    "en-IN": { "female": "vidya", "male": "karun" }
  }
}
```

**Unavailable Response `200`:**

```json
{
  "status": "unavailable",
  "message": "Chatbot service not initialized. Please set SARVAM_API_KEY in .env"
}
```

---

### 2. POST `/api/chat`

Send a text message to the chatbot. Supports English, Hindi, Punjabi and Hinglish.

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "messages": [{ "role": "user", "content": "Price of Banana in Ludhiana" }],
  "language": "auto",
  "include_voice": false,
  "include_forecast": true,
  "include_nearby": true
}
```

| Field              | Type    | Required | Default  | Description                          |
| ------------------ | ------- | -------- | -------- | ------------------------------------ |
| `messages`         | array   | ✅       | —        | Array of `{ role, content }` objects |
| `language`         | string  | ❌       | `"auto"` | `auto`, `hi-IN`, `pa-IN`, `en-IN`    |
| `include_voice`    | boolean | ❌       | `false`  | Return base64 audio response         |
| `include_forecast` | boolean | ❌       | `true`   | Include forecast data                |
| `include_nearby`   | boolean | ❌       | `true`   | Include nearby mandis                |

**Success Response `200`:**

```json
{
  "response": "Here are the prices for Banana in mandis near Ludhiana:\n\n1. Ludhiana APMC: ₹1800 per quintal\n2. Khanna APMC: ₹1750 per quintal",
  "audio": null,
  "detected_language": "en-IN",
  "forecast_data": null,
  "nearby_mandis": null,
  "timestamp": "2026-03-07T10:30:00"
}
```

**Hindi Request Example:**

```json
{
  "messages": [
    { "role": "user", "content": "लुधियाना में केले का भाव क्या है?" }
  ],
  "language": "auto"
}
```

**Hindi Response `200`:**

```json
{
  "response": "लुधियाना के पास मंडियों में केले के भाव:\n\n1. Ludhiana APMC: ₹1800 प्रति क्विंटल\n2. Khanna APMC: ₹1750 प्रति क्विंटल",
  "audio": null,
  "detected_language": "hi-IN",
  "forecast_data": null,
  "nearby_mandis": null,
  "timestamp": "2026-03-07T10:30:00"
}
```

**Multi-turn Conversation Example:**

```json
{
  "messages": [
    { "role": "user", "content": "Predict price of Potato" },
    { "role": "assistant", "content": "Which district?" },
    { "role": "user", "content": "Ludhiana" }
  ],
  "language": "auto",
  "include_forecast": true
}
```

**Multi-turn Response `200`:**

```json
{
  "response": "📊 7-Day Price Forecast\n🌾 Potato  |  📍 Ludhiana\n\n🏪 Samrala  📈 +5.6%\n  Fri, 06 Mar: ₹1,809\n  Sat, 07 Mar: ₹1,780\n  ...",
  "audio": null,
  "detected_language": "en-IN",
  "forecast_data": {
    "forecast": {
      "Samrala": [
        1808.66, 1780.45, 1958.11, 1899.71, 1919.27, 1909.37, 1909.37
      ],
      "Ludhiana": [600, 600, 600, 600, 600, 600, 600],
      "Khanna": [693.9, 701.04, 701.04, 701.04, 701.04, 701.04, 701.04]
    },
    "recommendation": {
      "action": "WAIT",
      "sell_after_days": 3,
      "best_market": "Samrala",
      "expected_price": 1958.11,
      "explanation": [
        "Significant price increase predicted in upcoming days",
        "Peak price expected on day 3"
      ]
    }
  },
  "nearby_mandis": null,
  "timestamp": "2026-03-07T10:30:00"
}
```

**400 - Missing messages:**

```json
{ "error": "messages array is required" }
```

---

### 3. POST `/api/chat/voice`

Send a voice message. Uses `multipart/form-data`.

**Request (form-data):**

| Key             | Type | Required | Description                       |
| --------------- | ---- | -------- | --------------------------------- |
| `audio`         | File | ✅       | `.wav` or `.mp3` audio file       |
| `language`      | Text | ❌       | `auto`, `hi-IN`, `pa-IN`, `en-IN` |
| `include_voice` | Text | ❌       | `true` or `false`                 |

**Success Response `200`:**

```json
{
  "user_text": "Ludhiana mein aalu ka kya bhav hai",
  "detected_language": "hi-IN",
  "response": "लुधियाना के पास मंडियों में आलू के भाव:\n\n1. Ludhiana APMC: ₹600 per quintal",
  "audio": "UklGRiQAAABXQVZFZm10IBAAAA...",
  "forecast_data": null,
  "nearby_mandis": null
}
```

**400 - Missing audio:**

```json
{ "error": "Audio file is required" }
```

---

## Forecast Routes

Base path: `/api/forecast`

---

### 4. POST `/api/forecast`

Get a 7-day AI price forecast for a commodity in a district.

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "commodity": "Potato",
  "state": "Punjab",
  "district": "Ludhiana"
}
```

**Success Response `200`:**

```json
{
  "forecast": {
    "Samrala": [1808.66, 1780.45, 1958.11, 1899.71, 1919.27, 1909.37, 1909.37],
    "Ludhiana": [600.0, 600.0, 600.0, 600.0, 600.0, 600.0, 600.0],
    "Khanna": [693.9, 701.04, 701.04, 701.04, 701.04, 701.04, 701.04],
    "Sahnewal": [1193.68, 1195.11, 1195.11, 1195.11, 1195.11, 1195.11, 1195.11]
  },
  "recommendation": {
    "action": "WAIT",
    "sell_after_days": 3,
    "best_market": "Samrala",
    "expected_price": 1958.11,
    "expected_profit": 350,
    "explanation": [
      "Significant price increase predicted in upcoming days",
      "Peak price expected on day 3"
    ]
  }
}
```

**400 - Missing fields:**

```json
{ "error": "commodity, state and district are required" }
```

**404 - No data found:**

```json
{ "error": "No training data found for Potato in Ludhiana" }
```

---

### 5. POST `/api/forecast/recommendation`

Get a sell/wait recommendation based on the forecast.

**Request Body:**

```json
{
  "commodity": "Onion",
  "state": "Punjab",
  "district": "Amritsar"
}
```

**Success Response `200` (SELL):**

```json
{
  "action": "SELL",
  "sell_after_days": 0,
  "best_market": "Amritsar APMC",
  "expected_price": 2100,
  "expected_profit": 450,
  "explanation": [
    "Prices expected to decline over next 7 days",
    "Current prices are at peak"
  ]
}
```

**Success Response `200` (WAIT):**

```json
{
  "action": "WAIT",
  "sell_after_days": 4,
  "best_market": "Khanna APMC",
  "expected_price": 2400,
  "expected_profit": 750,
  "explanation": [
    "Price increase of 15% expected over next 4 days",
    "Khanna APMC shows highest projected price"
  ]
}
```

---

### 6. POST `/api/forecast/graph`

Generate a prediction graph for a commodity.

**Request Body:**

```json
{
  "commodity": "Tomato",
  "state": "Punjab",
  "district": "Jalandhar"
}
```

**Success Response `200`:**

```json
{
  "message": "Prediction graph generated successfully"
}
```

---

### 7. POST `/api/forecast/train`

Train XGBoost models for a commodity and district.

**Request Body:**

```json
{
  "commodity": "Wheat",
  "state": "Punjab",
  "district": "Ludhiana"
}
```

**Success Response `200`:**

```json
{
  "message": "Model training completed",
  "commodity": "Wheat",
  "district": "Ludhiana",
  "model_performance": {
    "Ludhiana APMC": { "mae": 45.2, "rmse": 62.1, "r2": 0.87 },
    "Khanna APMC": { "mae": 38.7, "rmse": 51.3, "r2": 0.91 },
    "Samrala APMC": { "mae": 41.5, "rmse": 55.8, "r2": 0.89 }
  }
}
```

**404 - No dataset:**

```json
{ "error": "No dataset found" }
```

---

## Mandi Routes

Base path: `/api/mandi`

---

### 8. POST `/api/mandi/comparison`

Compare mandis to find the best price after transport cost.

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "commodity": "Potato",
  "state": "Punjab",
  "district": "Ludhiana",
  "transport_cost": 50
}
```

| Field            | Type   | Required | Default | Description      |
| ---------------- | ------ | -------- | ------- | ---------------- |
| `commodity`      | string | ✅       | —       | Crop name        |
| `state`          | string | ✅       | —       | State name       |
| `district`       | string | ✅       | —       | District name    |
| `transport_cost` | number | ❌       | `50`    | Cost per km in ₹ |

**Success Response `200`:**

```json
{
  "comparison": [
    {
      "market": "Samrala APMC",
      "price": 1958,
      "distance": 28.4,
      "transport_cost": 1420,
      "net_price": 538
    },
    {
      "market": "Ludhiana APMC",
      "price": 1800,
      "distance": 0,
      "transport_cost": 0,
      "net_price": 1800
    },
    {
      "market": "Khanna APMC",
      "price": 1750,
      "distance": 35.2,
      "transport_cost": 1760,
      "net_price": -10
    }
  ],
  "best_mandi": {
    "market": "Ludhiana APMC",
    "price": 1800,
    "distance": 0,
    "net_price": 1800
  }
}
```

---

### 9. GET `/api/mandi/price`

Get the current price for a specific mandi.

**Query Params:**

| Param       | Required | Example         |
| ----------- | -------- | --------------- |
| `market`    | ✅       | `Ludhiana APMC` |
| `commodity` | ✅       | `Banana`        |
| `state`     | ❌       | `Punjab`        |
| `district`  | ❌       | `Ludhiana`      |

**Request:**

```
GET http://localhost:5000/api/mandi/price?market=Ludhiana APMC&commodity=Banana&state=Punjab&district=Ludhiana
```

**Success Response `200`:**

```json
[
  {
    "state": "Punjab",
    "district": "Ludhiana",
    "market": "Ludhiana APMC",
    "commodity": "Banana",
    "variety": "Other",
    "grade": "Medium",
    "min_price": 1500,
    "max_price": 2000,
    "modal_price": 1800,
    "arrival_date": "06/03/2026"
  }
]
```

**No data Response `200`:**

```json
{ "message": "Commodity not available in this mandi today" }
```

---

### 10. GET `/api/mandi/nearby`

Get mandis near a location using GPS coordinates.

**Query Params:**

| Param | Required | Example   |
| ----- | -------- | --------- |
| `lat` | ✅       | `30.9010` |
| `lon` | ✅       | `75.8573` |

**Request:**

```
GET http://localhost:5000/api/mandi/nearby?lat=30.9010&lon=75.8573
```

**Success Response `200`:**

```json
{
  "nearby_mandis": [
    {
      "Market": "Ludhiana APMC",
      "District": "Ludhiana",
      "State": "Punjab",
      "Latitude": 30.91,
      "Longitude": 75.86,
      "distance_km": 2.1
    },
    {
      "Market": "Sahnewal APMC",
      "District": "Ludhiana",
      "State": "Punjab",
      "Latitude": 30.87,
      "Longitude": 75.93,
      "distance_km": 9.4
    },
    {
      "Market": "Samrala APMC",
      "District": "Ludhiana",
      "State": "Punjab",
      "Latitude": 30.84,
      "Longitude": 76.19,
      "distance_km": 28.6
    }
  ]
}
```

---

### 11. GET `/api/mandi/nearby-prices`

Get commodity prices from mandis near a location.

**Query Params:**

| Param       | Required | Example   |
| ----------- | -------- | --------- |
| `lat`       | ✅       | `30.9010` |
| `lon`       | ✅       | `75.8573` |
| `commodity` | ✅       | `Orange`  |

**Request:**

```
GET http://localhost:5000/api/mandi/nearby-prices?lat=30.9010&lon=75.8573&commodity=Orange
```

**Success Response `200`:**

```json
{
  "commodity": "Orange",
  "nearby_prices": [
    {
      "Market": "Ludhiana APMC",
      "District": "Ludhiana",
      "State": "Punjab",
      "Commodity": "Orange",
      "Variety": "Other",
      "Grade": "Medium",
      "Modal_Price": 10000,
      "Min_Price": 7000,
      "Max_Price": 15000,
      "Arrival_Date": "06/03/2026"
    },
    {
      "Market": "Khanna APMC",
      "District": "Ludhiana",
      "State": "Punjab",
      "Commodity": "Orange",
      "Variety": "Orange",
      "Grade": "Grade A",
      "Modal_Price": 7000,
      "Min_Price": 7000,
      "Max_Price": 7000,
      "Arrival_Date": "05/03/2026"
    }
  ]
}
```

**No data Response `200`:**

```json
{
  "commodity": "Orange",
  "nearby_prices": [
    {
      "Market": "Samrala APMC",
      "District": "Ludhiana",
      "State": "Punjab",
      "Commodity": "Orange",
      "message": "Orange not available in this market today"
    }
  ]
}
```

---

### 12. GET `/api/mandi/history`

Get the last 7 available price records for a commodity in a mandi.

**Query Params:**

| Param       | Required | Example         |
| ----------- | -------- | --------------- |
| `market`    | ✅       | `Ludhiana APMC` |
| `commodity` | ✅       | `Orange`        |

**Request:**

```
GET http://localhost:5000/api/mandi/history?market=Ludhiana APMC&commodity=Orange
```

**Success Response `200`:**

```json
{
  "market": "Ludhiana APMC",
  "commodity": "Orange",
  "last_7_available_records": [
    { "date": "21/02/2026", "price": 10000 },
    { "date": "23/02/2026", "price": 7000 },
    { "date": "24/02/2026", "price": 7000 },
    { "date": "25/02/2026", "price": 10000 },
    { "date": "28/02/2026", "price": 10000 },
    { "date": "03/03/2026", "price": 10000 },
    { "date": "06/03/2026", "price": 10000 }
  ]
}
```

**No data Response `200`:**

```json
{
  "market": "Ludhiana APMC",
  "commodity": "Orange",
  "last_7_available_records": []
}
```

---

### 13. GET `/api/mandi/history-graph`

Get a price trend graph as a PNG image.

**Query Params:**

| Param       | Required | Example         |
| ----------- | -------- | --------------- |
| `market`    | ✅       | `Ludhiana APMC` |
| `commodity` | ✅       | `Orange`        |

**Request:**

```
GET http://localhost:5000/api/mandi/history-graph?market=Ludhiana APMC&commodity=Orange
```

**Response:** Returns a `image/png` binary stream.

> In Postman: Click **Send** → then **Save Response → Save to a file** → save as `graph.png`

---

## Error Responses

All endpoints return consistent error objects:

### 400 — Bad Request (missing required fields)

```json
{ "error": "commodity, state and district are required" }
```

### 400 — Bad Request (missing query params)

```json
{ "error": "market and commodity query params are required" }
```

### 500 — FastAPI Not Running

```json
{
  "error": "FastAPI service is not running at http://localhost:8000. Start it with: uvicorn main:app --reload"
}
```

### 500 — FastAPI Timeout

```json
{ "error": "FastAPI service timed out. Check if it is running." }
```

### 500 — General Server Error

```json
{ "error": "Internal server error message here" }
```

---

## Quick Reference Table

| Method | Endpoint                       | Description          | Body/Params                                        |
| ------ | ------------------------------ | -------------------- | -------------------------------------------------- |
| GET    | `/api/chat/health`             | Chatbot status       | —                                                  |
| POST   | `/api/chat`                    | Text chat            | `messages`, `language`                             |
| POST   | `/api/chat/voice`              | Voice chat           | `audio` (file), `language`                         |
| POST   | `/api/forecast`                | 7-day forecast       | `commodity`, `state`, `district`                   |
| POST   | `/api/forecast/recommendation` | Sell/wait advice     | `commodity`, `state`, `district`                   |
| POST   | `/api/forecast/graph`          | Prediction graph     | `commodity`, `state`, `district`                   |
| POST   | `/api/forecast/train`          | Train ML models      | `commodity`, `state`, `district`                   |
| POST   | `/api/mandi/comparison`        | Compare mandis       | `commodity`, `state`, `district`, `transport_cost` |
| GET    | `/api/mandi/price`             | Specific mandi price | `?market=&commodity=&state=&district=`             |
| GET    | `/api/mandi/nearby`            | Nearby mandis        | `?lat=&lon=`                                       |
| GET    | `/api/mandi/nearby-prices`     | Prices near location | `?lat=&lon=&commodity=`                            |
| GET    | `/api/mandi/history`           | Last 7 price records | `?market=&commodity=`                              |
| GET    | `/api/mandi/history-graph`     | Price trend PNG      | `?market=&commodity=`                              |
