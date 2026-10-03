import { useState } from "react";
import "../pages/Dashboard.css";

const BASE = "http://localhost:5000";

export default function NearbyMandis() {
  const [coords, setCoords] = useState({ lat: "30.9010", lon: "75.8573" });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [error, setError] = useState("");

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
        setError("GPS not available. Enter manually.");
        setGpsLoading(false);
      },
    );
  };

  const fetchNearby = async () => {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch(
        `${BASE}/api/mandi/nearby?lat=${coords.lat}&lon=${coords.lon}`,
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setData(json);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const mandis = data?.nearby_mandis || [];

  return (
    <div>
      <div className="page-header">
        <h1>📍 Nearby Mandis</h1>
        <p>Find agricultural markets near your location</p>
      </div>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="card-title">📡 Enter Your Location</div>
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
            marginBottom: "1rem",
          }}
        >
          <button
            className="btn btn-outline btn-sm"
            onClick={getGPS}
            disabled={gpsLoading}
          >
            {gpsLoading ? "⏳ Getting..." : "📡 Use My GPS"}
          </button>
          <span
            style={{
              color: "var(--gray-500)",
              alignSelf: "center",
              fontSize: "0.85rem",
            }}
          >
            or enter manually
          </span>
        </div>
        <div
          className="two-col"
          style={{ maxWidth: "480px", marginBottom: "1rem" }}
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
              placeholder="e.g. 30.9010"
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
              placeholder="e.g. 75.8573"
            />
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={fetchNearby}
          disabled={loading}
        >
          {loading ? "⏳ Searching..." : "📍 Find Nearby Mandis"}
        </button>
      </div>

      {error && <div style={styles.errorBox}>⚠️ {error}</div>}
      {loading && (
        <div className="loading-box">
          <div className="spinner" />
          <span>Finding mandis near you...</span>
        </div>
      )}

      {data && (
        <div className="card">
          <div className="card-title">
            🏪 {mandis.length} Mandis Found Near You
          </div>
          {mandis.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🗺️</div>
              <h3>No mandis found nearby</h3>
              <p>Try a different location or expand your search area.</p>
            </div>
          ) : (
            <div className="mandi-list">
              {mandis.map((m, i) => (
                <div key={i} className="mandi-item">
                  <div>
                    <div className="mandi-name">🏪 {m.Market}</div>
                    <div className="mandi-district">
                      📍 {m.District}, {m.State}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--gray-500)",
                        marginTop: "2px",
                      }}
                    >
                      🌐 {m.Latitude?.toFixed(4)}, {m.Longitude?.toFixed(4)}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: "0.4rem",
                    }}
                  >
                    <div className="mandi-distance">
                      {m.distance_km?.toFixed(1)} km
                    </div>
                    {i === 0 && (
                      <span className="badge badge-green">Nearest</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* INFO BOX */}
      <div style={styles.infoBox}>
        <div style={styles.infoIcon}>ℹ️</div>
        <div>
          <div
            style={{
              fontWeight: 600,
              fontSize: "0.88rem",
              color: "var(--green-dark)",
            }}
          >
            Default: Ludhiana, Punjab
          </div>
          <div
            style={{
              fontSize: "0.8rem",
              color: "var(--gray-500)",
              marginTop: "2px",
            }}
          >
            Coordinates: 30.9010°N, 75.8573°E
          </div>
        </div>
      </div>
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
  infoBox: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "center",
    background: "var(--green-pale)",
    border: "1px solid var(--green-soft)",
    borderRadius: "var(--radius)",
    padding: "0.85rem 1rem",
    marginTop: "1rem",
  },
  infoIcon: { fontSize: "1.3rem" },
};
