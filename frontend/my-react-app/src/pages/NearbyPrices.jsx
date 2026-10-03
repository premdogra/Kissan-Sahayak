import { useState } from "react";
import "../pages/Dashboard.css";

const BASE = "http://localhost:5000";
const COMMODITIES = [
  "Potato",
  "Wheat",
  "Tomato",
  "Onion",
  "Banana",
  "Orange",
  "Rice",
  "Maize",
  "Mustard",
];
const CROP_EMOJIS = {
  Wheat: "🌾",
  Potato: "🥔",
  Tomato: "🍅",
  Onion: "🧅",
  Banana: "🍌",
  Orange: "🍊",
  Rice: "🍚",
  Maize: "🌽",
  Mustard: "🌻",
};

export default function NearbyPrices() {
  const [coords, setCoords] = useState({ lat: "30.9010", lon: "75.8573" });
  const [commodity, setCommodity] = useState("Potato");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);

  const getGPS = () => {
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude.toFixed(4),
          lon: pos.coords.longitude.toFixed(4),
        });
        setGpsLoading(false);
      },
      () => {
        setError("GPS unavailable. Using default.");
        setGpsLoading(false);
      },
    );
  };

  const fetchPrices = async () => {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch(
        `${BASE}/api/mandi/nearby-prices?lat=${coords.lat}&lon=${coords.lon}&commodity=${encodeURIComponent(commodity)}`,
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setData(json);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const prices = data?.nearby_prices || [];
  const available = prices.filter((p) => !p.message);
  const maxPrice = available.length
    ? Math.max(...available.map((p) => p.Modal_Price))
    : 0;

  return (
    <div>
      <div className="page-header">
        <h1>🏷️ Nearby Mandi Prices</h1>
        <p>Compare commodity prices from all mandis near your location</p>
      </div>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="card-title">🔍 Search Parameters</div>
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            marginBottom: "1rem",
            flexWrap: "wrap",
          }}
        >
          <button
            className="btn btn-outline btn-sm"
            onClick={getGPS}
            disabled={gpsLoading}
          >
            {gpsLoading ? "⏳ Locating..." : "📡 Use GPS"}
          </button>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          <div className="form-group">
            <label className="form-label">Latitude</label>
            <input
              className="form-input"
              type="number"
              step="0.0001"
              value={coords.lat}
              onChange={(e) =>
                setCoords((c) => ({ ...c, lat: e.target.value }))
              }
            />
          </div>
          <div className="form-group">
            <label className="form-label">Longitude</label>
            <input
              className="form-input"
              type="number"
              step="0.0001"
              value={coords.lon}
              onChange={(e) =>
                setCoords((c) => ({ ...c, lon: e.target.value }))
              }
            />
          </div>
          <div className="form-group">
            <label className="form-label">Commodity</label>
            <select
              className="form-select"
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
            >
              {COMMODITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={fetchPrices}
          disabled={loading}
        >
          {loading ? "⏳ Fetching..." : "🏷️ Get Nearby Prices"}
        </button>
      </div>

      {error && <div style={styles.errorBox}>⚠️ {error}</div>}
      {loading && (
        <div className="loading-box">
          <div className="spinner" />
          <span>Fetching {commodity} prices from nearby mandis...</span>
        </div>
      )}

      {data && (
        <>
          <div style={styles.summaryBanner}>
            <span>{CROP_EMOJIS[commodity] || "🌿"}</span>
            <div>
              <div style={styles.sumTitle}>{commodity} Prices</div>
              <div style={styles.sumSub}>
                {available.length} mandis with live prices nearby
              </div>
            </div>
            {maxPrice > 0 && (
              <div style={styles.sumBest}>
                <div style={{ fontSize: "0.78rem", opacity: 0.8 }}>Highest</div>
                <div
                  style={{
                    fontFamily: "'Baloo 2', cursive",
                    fontSize: "1.2rem",
                    fontWeight: 800,
                  }}
                >
                  ₹{maxPrice.toLocaleString("en-IN")}/q
                </div>
              </div>
            )}
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {prices.map((item, i) => {
              const isNA = !!item.message;
              const isHighest = !isNA && item.Modal_Price === maxPrice;
              return (
                <div
                  key={i}
                  style={{
                    ...styles.priceCard,
                    ...(isHighest ? styles.priceCardBest : {}),
                    ...(isNA ? styles.priceCardNA : {}),
                  }}
                >
                  <div style={styles.priceCardLeft}>
                    <div style={styles.priceMarket}>🏪 {item.Market}</div>
                    <div style={styles.priceMeta}>
                      {item.District}, {item.State}
                    </div>
                    {!isNA && (
                      <div style={styles.priceDate}>📅 {item.Arrival_Date}</div>
                    )}
                  </div>
                  {isNA ? (
                    <div style={styles.naTag}>Not available today</div>
                  ) : (
                    <div style={styles.priceRight}>
                      <div style={styles.modalPrice}>
                        ₹{item.Modal_Price?.toLocaleString("en-IN")}/q
                      </div>
                      <div style={styles.priceRange}>
                        ₹{item.Min_Price?.toLocaleString("en-IN")} – ₹
                        {item.Max_Price?.toLocaleString("en-IN")}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "0.4rem",
                          marginTop: "0.3rem",
                        }}
                      >
                        {isHighest && (
                          <span className="badge badge-green">Highest</span>
                        )}
                        {item.Grade && (
                          <span className="badge badge-blue">{item.Grade}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  errorBox: {
    background: "#fce4ec",
    border: "1px solid #ef9a9a",
    borderRadius: "var(--radius)",
    padding: "0.85rem",
    color: "var(--red)",
    marginBottom: "1rem",
    fontSize: "0.9rem",
  },
  summaryBanner: {
    background: "linear-gradient(135deg, var(--green-dark), var(--green-mid))",
    borderRadius: "var(--radius-lg)",
    padding: "1.25rem 1.5rem",
    marginBottom: "1.25rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    color: "white",
    fontSize: "2rem",
  },
  sumTitle: {
    fontFamily: "'Baloo 2', cursive",
    fontSize: "1.2rem",
    fontWeight: 800,
  },
  sumSub: { fontSize: "0.85rem", opacity: 0.85 },
  sumBest: { marginLeft: "auto", textAlign: "right", color: "white" },
  priceCard: {
    background: "white",
    border: "1px solid var(--gray-200)",
    borderRadius: "var(--radius)",
    padding: "1rem 1.25rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "all 0.2s",
  },
  priceCardBest: {
    border: "1.5px solid var(--green-main)",
    background: "var(--green-pale)",
  },
  priceCardNA: { background: "var(--gray-50)", opacity: 0.7 },
  priceCardLeft: { flex: 1 },
  priceMarket: {
    fontWeight: 700,
    fontSize: "0.95rem",
    color: "var(--gray-900)",
  },
  priceMeta: {
    fontSize: "0.78rem",
    color: "var(--gray-500)",
    marginTop: "2px",
  },
  priceDate: {
    fontSize: "0.75rem",
    color: "var(--gray-500)",
    marginTop: "2px",
  },
  naTag: { color: "var(--gray-500)", fontStyle: "italic", fontSize: "0.85rem" },
  priceRight: { textAlign: "right" },
  modalPrice: {
    fontFamily: "'Baloo 2', cursive",
    fontSize: "1.2rem",
    fontWeight: 800,
    color: "var(--green-dark)",
  },
  priceRange: {
    fontSize: "0.78rem",
    color: "var(--gray-500)",
    marginTop: "2px",
  },
};
