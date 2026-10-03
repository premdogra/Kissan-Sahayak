// import { useState } from "react";
// import "../pages/Dashboard.css";

// const BASE = "http://localhost:5000";
// const COMMODITIES = [
//   "Potato",
//   "Wheat",
//   "Tomato",
//   "Onion",
//   "Banana",
//   "Orange",
//   "Rice",
//   "Maize",
//   "Mustard",
// ];
// const MARKETS = [
//   "Ludhiana APMC",
//   "Amritsar APMC",
//   "Jalandhar APMC",
//   "Khanna APMC",
//   "Samrala APMC",
//   "Sahnewal APMC",
//   "Patiala APMC",
// ];

// // Tiny inline chart using SVG
// function MiniLineChart({ prices }) {
//   if (!prices || prices.length < 2) return null;
//   const w = 400,
//     h = 100,
//     pad = 20;
//   const max = Math.max(...prices);
//   const min = Math.min(...prices);
//   const range = max - min || 1;
//   const pts = prices
//     .map((p, i) => {
//       const x = pad + (i / (prices.length - 1)) * (w - pad * 2);
//       const y = h - pad - ((p - min) / range) * (h - pad * 2);
//       return `${x},${y}`;
//     })
//     .join(" ");
//   const firstPt = pts.split(" ")[0];
//   const lastPt = pts.split(" ")[prices.length - 1];
//   const [lx, ly] = lastPt.split(",");
//   const [fx, fy] = firstPt.split(",");
//   const trend = prices[prices.length - 1] >= prices[0];

//   return (
//     <div style={{ width: "100%", overflowX: "auto" }}>
//       <svg
//         viewBox={`0 0 ${w} ${h}`}
//         style={{ width: "100%", maxWidth: "500px", height: "100px" }}
//       >
//         <defs>
//           <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
//             <stop
//               offset="0%"
//               stopColor={trend ? "#43a047" : "#e53935"}
//               stopOpacity="0.3"
//             />
//             <stop
//               offset="100%"
//               stopColor={trend ? "#43a047" : "#e53935"}
//               stopOpacity="0.02"
//             />
//           </linearGradient>
//         </defs>
//         <polyline
//           points={pts}
//           fill="none"
//           stroke={trend ? "#2e7d32" : "#c62828"}
//           strokeWidth="2.5"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//         />
//         {/* Area fill */}
//         <polygon
//           points={`${fx},${h - pad} ${pts} ${lx},${h - pad}`}
//           fill="url(#chartGrad)"
//         />
//         {/* Points */}
//         {prices.map((p, i) => {
//           const x = pad + (i / (prices.length - 1)) * (w - pad * 2);
//           const y = h - pad - ((p - min) / range) * (h - pad * 2);
//           return (
//             <circle
//               key={i}
//               cx={x}
//               cy={y}
//               r="4"
//               fill="white"
//               stroke={trend ? "#2e7d32" : "#c62828"}
//               strokeWidth="2"
//             />
//           );
//         })}
//       </svg>
//     </div>
//   );
// }

// export default function MandiHistory() {
//   const [form, setForm] = useState({
//     market: "Ludhiana APMC",
//     commodity: "Orange",
//   });
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [showGraph, setShowGraph] = useState(false);

//   const fetchHistory = async () => {
//     setLoading(true);
//     setError("");
//     setData(null);
//     try {
//       const params = new URLSearchParams(form);
//       const res = await fetch(`${BASE}/api/mandi/history?${params}`);
//       const json = await res.json();
//       if (!res.ok) throw new Error(json.error || "Failed");
//       setData(json);
//     } catch (e) {
//       setError(e.message);
//     }
//     setLoading(false);
//   };

//   const records = data?.last_7_available_records || [];
//   const prices = records.map((r) => r.price);
//   const maxP = prices.length ? Math.max(...prices) : 0;
//   const minP = prices.length ? Math.min(...prices) : 0;
//   const latestP = prices[prices.length - 1];
//   const firstP = prices[0];
//   const trend =
//     prices.length >= 2
//       ? (((latestP - firstP) / firstP) * 100).toFixed(1)
//       : null;

//   return (
//     <div>
//       <div className="page-header">
//         <h1>📈 Price History</h1>
//         <p>
//           Last 7 available price records for a commodity at a specific mandi
//         </p>
//       </div>

//       <div className="card" style={{ marginBottom: "1.5rem" }}>
//         <div className="card-title">🔍 Select Market & Commodity</div>
//         <div className="two-col" style={{ marginBottom: "1rem" }}>
//           <div className="form-group">
//             <label className="form-label">Market / Mandi</label>
//             <select
//               className="form-select"
//               value={form.market}
//               onChange={(e) =>
//                 setForm((f) => ({ ...f, market: e.target.value }))
//               }
//             >
//               {MARKETS.map((m) => (
//                 <option key={m}>{m}</option>
//               ))}
//             </select>
//           </div>
//           <div className="form-group">
//             <label className="form-label">Commodity</label>
//             <select
//               className="form-select"
//               value={form.commodity}
//               onChange={(e) =>
//                 setForm((f) => ({ ...f, commodity: e.target.value }))
//               }
//             >
//               {COMMODITIES.map((c) => (
//                 <option key={c}>{c}</option>
//               ))}
//             </select>
//           </div>
//         </div>
//         <div style={{ display: "flex", gap: "0.75rem" }}>
//           <button
//             className="btn btn-primary"
//             onClick={fetchHistory}
//             disabled={loading}
//           >
//             {loading ? "⏳ Loading..." : "📈 Get History"}
//           </button>
//           <button
//             className="btn btn-outline"
//             onClick={() => {
//               fetchHistory();
//               setShowGraph(true);
//             }}
//           >
//             📊 View Graph
//           </button>
//         </div>
//       </div>

//       {error && <div style={styles.errorBox}>⚠️ {error}</div>}
//       {loading && (
//         <div className="loading-box">
//           <div className="spinner" />
//           <span>Fetching price history...</span>
//         </div>
//       )}

//       {data && records.length === 0 && (
//         <div className="empty-state card">
//           <div className="empty-icon">📭</div>
//           <h3>No history found</h3>
//           <p>
//             No price records available for {form.commodity} at {form.market}.
//           </p>
//         </div>
//       )}

//       {data && records.length > 0 && (
//         <>
//           {/* TREND STATS */}
//           <div className="stat-grid" style={{ marginBottom: "1.25rem" }}>
//             <div className="stat-card">
//               <div className="stat-icon green">📈</div>
//               <div className="stat-label">Latest Price</div>
//               <div className="stat-value">
//                 ₹{latestP?.toLocaleString("en-IN")}
//               </div>
//               <div className="stat-change" style={{ color: "var(--gray-500)" }}>
//                 per quintal
//               </div>
//             </div>
//             <div className="stat-card">
//               <div className="stat-icon orange">⬆️</div>
//               <div className="stat-label">Highest</div>
//               <div className="stat-value">₹{maxP?.toLocaleString("en-IN")}</div>
//             </div>
//             <div className="stat-card">
//               <div className="stat-icon blue">⬇️</div>
//               <div className="stat-label">Lowest</div>
//               <div className="stat-value">₹{minP?.toLocaleString("en-IN")}</div>
//             </div>
//             {trend !== null && (
//               <div className="stat-card">
//                 <div
//                   className={`stat-icon ${Number(trend) >= 0 ? "green" : "red"}`}
//                 >
//                   {Number(trend) >= 0 ? "🔺" : "🔻"}
//                 </div>
//                 <div className="stat-label">7-Day Trend</div>
//                 <div
//                   className={`stat-value ${Number(trend) >= 0 ? "" : ""}`}
//                   style={{
//                     color:
//                       Number(trend) >= 0 ? "var(--green-main)" : "var(--red)",
//                   }}
//                 >
//                   {Number(trend) >= 0 ? "+" : ""}
//                   {trend}%
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* CHART */}
//           <div className="card" style={{ marginBottom: "1.25rem" }}>
//             <div className="card-title">
//               📊 Price Trend — {form.commodity} @ {form.market}
//             </div>
//             <MiniLineChart prices={prices} />
//           </div>

//           {/* TABLE */}
//           <div className="card">
//             <div className="card-title">📋 Historical Records</div>
//             <table className="data-table">
//               <thead>
//                 <tr>
//                   <th>Date</th>
//                   <th>Price (₹/quintal)</th>
//                   <th>Change</th>
//                   <th>Bar</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {records.map((r, i) => {
//                   const prev = i > 0 ? records[i - 1].price : r.price;
//                   const diff = r.price - prev;
//                   const pct =
//                     prev > 0 && i > 0 ? ((diff / prev) * 100).toFixed(1) : null;
//                   const barPct = maxP > 0 ? (r.price / maxP) * 100 : 0;
//                   return (
//                     <tr key={i}>
//                       <td>📅 {r.date}</td>
//                       <td
//                         style={{
//                           fontFamily: "'Baloo 2', cursive",
//                           fontWeight: 700,
//                           color: "var(--green-dark)",
//                         }}
//                       >
//                         ₹{r.price?.toLocaleString("en-IN")}
//                       </td>
//                       <td>
//                         {pct !== null && (
//                           <span
//                             style={{
//                               color:
//                                 diff >= 0 ? "var(--green-main)" : "var(--red)",
//                               fontWeight: 600,
//                               fontSize: "0.83rem",
//                             }}
//                           >
//                             {diff >= 0 ? "▲" : "▼"} {Math.abs(pct)}%
//                           </span>
//                         )}
//                       </td>
//                       <td style={{ minWidth: "120px" }}>
//                         <div
//                           className="price-bar-track"
//                           style={{ height: "6px" }}
//                         >
//                           <div
//                             className="price-bar-fill"
//                             style={{ width: `${barPct}%` }}
//                           />
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

// const styles = {
//   errorBox: {
//     background: "#fce4ec",
//     border: "1px solid #ef9a9a",
//     borderRadius: "var(--radius)",
//     padding: "0.85rem",
//     color: "var(--red)",
//     marginBottom: "1rem",
//     fontSize: "0.9rem",
//   },
// };

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
const MARKETS = [
  "Ludhiana APMC",
  "Amritsar APMC",
  "Jalandhar APMC",
  "Khanna APMC",
  "Samrala APMC",
  "Sahnewal APMC",
  "Patiala APMC",
];

// Tiny inline chart using SVG
function MiniLineChart({ prices, maxPrices }) {
  // Use max prices for chart if available, otherwise fallback to regular prices
  const chartData = maxPrices || prices;

  if (!chartData || chartData.length < 2) return null;
  const w = 400,
    h = 100,
    pad = 20;
  const max = Math.max(...chartData);
  const min = Math.min(...chartData);
  const range = max - min || 1;
  const pts = chartData
    .map((p, i) => {
      const x = pad + (i / (chartData.length - 1)) * (w - pad * 2);
      const y = h - pad - ((p - min) / range) * (h - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");
  const firstPt = pts.split(" ")[0];
  const lastPt = pts.split(" ")[chartData.length - 1];
  const [lx, ly] = lastPt.split(",");
  const [fx, fy] = firstPt.split(",");
  const trend = chartData[chartData.length - 1] >= chartData[0];

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        style={{ width: "100%", maxWidth: "500px", height: "100px" }}
      >
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={trend ? "#43a047" : "#e53935"}
              stopOpacity="0.3"
            />
            <stop
              offset="100%"
              stopColor={trend ? "#43a047" : "#e53935"}
              stopOpacity="0.02"
            />
          </linearGradient>
        </defs>
        <polyline
          points={pts}
          fill="none"
          stroke={trend ? "#2e7d32" : "#c62828"}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Area fill */}
        <polygon
          points={`${fx},${h - pad} ${pts} ${lx},${h - pad}`}
          fill="url(#chartGrad)"
        />
        {/* Points */}
        {chartData.map((p, i) => {
          const x = pad + (i / (chartData.length - 1)) * (w - pad * 2);
          const y = h - pad - ((p - min) / range) * (h - pad * 2);
          const isMaxPrice = maxPrices && p === Math.max(...maxPrices);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={isMaxPrice ? "6" : "4"}
              fill={isMaxPrice ? "#ffd700" : "white"}
              stroke={isMaxPrice ? "#ff8c00" : trend ? "#2e7d32" : "#c62828"}
              strokeWidth={isMaxPrice ? "3" : "2"}
            />
          );
        })}
      </svg>
    </div>
  );
}

export default function MandiHistory() {
  const [form, setForm] = useState({
    market: "Ludhiana APMC",
    commodity: "Orange",
  });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showGraph, setShowGraph] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const params = new URLSearchParams(form);
      const res = await fetch(`${BASE}/api/mandi/history?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setData(json);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  // Get records from API
  const records = data?.last_7_available_records || [];

  // Extract different price types
  const modalPrices = records.map((r) => r.price); // Modal price
  const maxPrices = records.map((r) => r.max_price || r.price); // Max price (fallback to modal if not available)
  const minPrices = records.map((r) => r.min_price || r.price); // Min price (fallback to modal if not available)

  // Calculate statistics using MAX prices
  const overallMaxPrice = maxPrices.length ? Math.max(...maxPrices) : 0;
  const overallMinPrice = minPrices.length ? Math.min(...minPrices) : 0;
  const latestMaxPrice = maxPrices[maxPrices.length - 1] || 0;
  const firstMaxPrice = maxPrices[0] || 0;

  // Find the best day (day with highest max price)
  const bestDayIndex = maxPrices.indexOf(overallMaxPrice);
  const bestDay = bestDayIndex >= 0 ? bestDayIndex + 1 : null;

  // Calculate trend based on MAX prices
  const trend =
    maxPrices.length >= 2 && firstMaxPrice > 0
      ? (((latestMaxPrice - firstMaxPrice) / firstMaxPrice) * 100).toFixed(1)
      : null;

  // Calculate profit opportunity (if sold at max price vs current max price)
  const profitOpportunity = overallMaxPrice - latestMaxPrice;
  const profitPercent =
    latestMaxPrice > 0
      ? (((overallMaxPrice - latestMaxPrice) / latestMaxPrice) * 100).toFixed(1)
      : 0;

  // For 100 quintals (typical farmer lot)
  const profitFor100Quintals = profitOpportunity * 100;

  return (
    <div>
      <div className="page-header">
        <h1>📈 Maximum Price History</h1>
        <p>Showing the HIGHEST price achieved each day for the last 7 days</p>
      </div>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="card-title">🔍 Select Market & Commodity</div>
        <div className="two-col" style={{ marginBottom: "1rem" }}>
          <div className="form-group">
            <label className="form-label">Market / Mandi</label>
            <select
              className="form-select"
              value={form.market}
              onChange={(e) =>
                setForm((f) => ({ ...f, market: e.target.value }))
              }
            >
              {MARKETS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Commodity</label>
            <select
              className="form-select"
              value={form.commodity}
              onChange={(e) =>
                setForm((f) => ({ ...f, commodity: e.target.value }))
              }
            >
              {COMMODITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            className="btn btn-primary"
            onClick={fetchHistory}
            disabled={loading}
          >
            {loading ? "⏳ Loading..." : "📈 Get Max Prices"}
          </button>
          <button
            className="btn btn-outline"
            onClick={() => {
              fetchHistory();
              setShowGraph(true);
            }}
          >
            📊 View Graph
          </button>
        </div>
      </div>

      {error && <div style={styles.errorBox}>⚠️ {error}</div>}
      {loading && (
        <div className="loading-box">
          <div className="spinner" />
          <span>Fetching price history...</span>
        </div>
      )}

      {data && records.length === 0 && (
        <div className="empty-state card">
          <div className="empty-icon">📭</div>
          <h3>No history found</h3>
          <p>
            No price records available for {form.commodity} at {form.market}.
          </p>
        </div>
      )}

      {data && records.length > 0 && (
        <>
          {/* 🆕 PROFIT OPPORTUNITY CARD - HIGHLIGHT THIS */}
          {profitOpportunity > 0 && (
            <div style={styles.profitCard}>
              <div style={styles.profitHeader}>
                <span style={styles.profitIcon}>💰</span>
                <span style={styles.profitTitle}>MAXIMUM PRICE ANALYSIS</span>
              </div>
              <div style={styles.profitGrid}>
                <div style={styles.profitItem}>
                  <div style={styles.profitLabel}>Today's Max Price</div>
                  <div style={styles.profitValue}>
                    ₹{latestMaxPrice?.toLocaleString("en-IN")}
                  </div>
                </div>
                <div style={styles.profitItem}>
                  <div style={styles.profitLabel}>Best Max Price (7 Days)</div>
                  <div style={styles.profitValueHighlight}>
                    ₹{overallMaxPrice?.toLocaleString("en-IN")}
                  </div>
                  <div style={styles.profitBadge}>Day {bestDay}</div>
                </div>
                <div style={styles.profitItem}>
                  <div style={styles.profitLabel}>Price Difference</div>
                  <div style={styles.profitValueLoss}>
                    ₹{profitOpportunity?.toLocaleString("en-IN")}
                  </div>
                  <div style={styles.profitSmall}>
                    ({profitPercent}% higher)
                  </div>
                </div>
                <div style={styles.profitItem}>
                  <div style={styles.profitLabel}>For 100 Quintals</div>
                  <div style={styles.profitValueHighlight}>
                    ₹{profitFor100Quintals?.toLocaleString("en-IN")}
                  </div>
                  <div style={styles.profitSmall}>potential extra income</div>
                </div>
              </div>
              <div style={styles.profitAdvice}>
                {profitOpportunity > 200 ? (
                  <span>
                    🔥 You could have earned ₹{profitOpportunity} MORE per
                    quintal by selling on Day {bestDay}!
                  </span>
                ) : profitOpportunity > 100 ? (
                  <span>
                    📈 Good profit opportunity missed. Watch for price peaks!
                  </span>
                ) : profitOpportunity > 0 ? (
                  <span>
                    ✅ Small price variation. Current max price is close to the
                    weekly peak.
                  </span>
                ) : (
                  <span>🎯 You're at the weekly peak! Good timing!</span>
                )}
              </div>
            </div>
          )}

          {/* STATS CARDS - Using MAX prices */}
          <div className="stat-grid" style={{ marginBottom: "1.25rem" }}>
            <div className="stat-card">
              <div className="stat-icon green">📈</div>
              <div className="stat-label">Today's Max Price</div>
              <div className="stat-value">
                ₹{latestMaxPrice?.toLocaleString("en-IN")}
              </div>
              <div className="stat-change" style={{ color: "var(--gray-500)" }}>
                per quintal (highest)
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon orange">⬆️</div>
              <div className="stat-label">7-Day Peak</div>
              <div className="stat-value">
                ₹{overallMaxPrice?.toLocaleString("en-IN")}
              </div>
              <div className="stat-change">Day {bestDay}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon blue">⬇️</div>
              <div className="stat-label">7-Day Lowest Max</div>
              <div className="stat-value">
                ₹{overallMinPrice?.toLocaleString("en-IN")}
              </div>
            </div>
            {trend !== null && (
              <div className="stat-card">
                <div
                  className={`stat-icon ${Number(trend) >= 0 ? "green" : "red"}`}
                >
                  {Number(trend) >= 0 ? "🔺" : "🔻"}
                </div>
                <div className="stat-label">Max Price Trend</div>
                <div
                  className={`stat-value`}
                  style={{
                    color:
                      Number(trend) >= 0 ? "var(--green-main)" : "var(--red)",
                  }}
                >
                  {Number(trend) >= 0 ? "+" : ""}
                  {trend}%
                </div>
              </div>
            )}
          </div>

          {/* CHART - Using MAX prices */}
          <div className="card" style={{ marginBottom: "1.25rem" }}>
            <div className="card-title">
              📊 Maximum Price Trend — {form.commodity} @ {form.market}
              {bestDay && (
                <span style={styles.bestDayBadge}>🌟 Peak: Day {bestDay}</span>
              )}
            </div>
            <MiniLineChart prices={modalPrices} maxPrices={maxPrices} />
            <div
              style={{
                fontSize: "12px",
                color: "#666",
                marginTop: "8px",
                textAlign: "center",
              }}
            >
              ⭐ Gold dots show the highest price achieved each day
            </div>
          </div>

          {/* TABLE - Showing all three prices */}
          <div className="card">
            <div className="card-title">📋 Daily Price Details</div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Min Price (₹)</th>
                  <th>Max Price (₹)</th>
                  <th>Modal Price (₹)</th>
                  <th>Range</th>
                  <th>Bar (vs Peak)</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => {
                  const minPrice = r.min_price || r.price;
                  const maxPrice = r.max_price || r.price;
                  const modalPrice = r.price;
                  const priceRange = maxPrice - minPrice;
                  const isPeakDay = maxPrice === overallMaxPrice;
                  const barPct =
                    overallMaxPrice > 0
                      ? (maxPrice / overallMaxPrice) * 100
                      : 0;

                  return (
                    <tr
                      key={i}
                      style={isPeakDay ? { backgroundColor: "#fff9e6" } : {}}
                    >
                      <td>📅 {r.date}</td>
                      <td style={{ color: "#1976d2", fontWeight: 600 }}>
                        ₹{minPrice?.toLocaleString("en-IN")}
                      </td>
                      <td
                        style={{
                          color: isPeakDay ? "#ff8c00" : "#2e7d32",
                          fontWeight: 700,
                          fontSize: "1.1em",
                        }}
                      >
                        ₹{maxPrice?.toLocaleString("en-IN")}
                        {isPeakDay && <span style={styles.starBadge}> ⭐</span>}
                      </td>
                      <td style={{ color: "#757575" }}>
                        ₹{modalPrice?.toLocaleString("en-IN")}
                      </td>
                      <td>
                        <span
                          style={{
                            color: priceRange > 200 ? "#e53935" : "#fb8c00",
                            fontWeight: 600,
                          }}
                        >
                          ₹{priceRange}
                        </span>
                      </td>
                      <td style={{ minWidth: "120px" }}>
                        <div style={{ position: "relative" }}>
                          <div
                            className="price-bar-track"
                            style={{ height: "8px" }}
                          >
                            <div
                              className="price-bar-fill"
                              style={{
                                width: `${barPct}%`,
                                background: isPeakDay
                                  ? "linear-gradient(90deg, #ffd700, #ff8c00)"
                                  : undefined,
                              }}
                            />
                          </div>
                          {isPeakDay && (
                            <div
                              style={{
                                position: "absolute",
                                top: "-15px",
                                left: `${barPct}%`,
                                transform: "translateX(-50%)",
                                color: "#ff8c00",
                                fontSize: "14px",
                                fontWeight: "bold",
                              }}
                            >
                              PEAK
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Summary Card */}
            <div style={styles.summaryCard}>
              <div style={styles.summaryTitle}>📊 Maximum Price Summary</div>
              <div style={styles.summaryGrid}>
                <div>
                  <div style={styles.summaryLabel}>Peak Max Price</div>
                  <div style={styles.summaryValue}>
                    ₹{overallMaxPrice}/quintal
                  </div>
                  <div style={styles.summarySmall}>Day {bestDay}</div>
                </div>
                <div>
                  <div style={styles.summaryLabel}>Today's Max</div>
                  <div style={styles.summaryValue}>
                    ₹{latestMaxPrice}/quintal
                  </div>
                </div>
                <div>
                  <div style={styles.summaryLabel}>Price Gap</div>
                  <div
                    style={{
                      ...styles.summaryValue,
                      color: profitOpportunity > 0 ? "#e53935" : "#2e7d32",
                    }}
                  >
                    ₹{Math.abs(profitOpportunity)}
                  </div>
                </div>
                <div>
                  <div style={styles.summaryLabel}>100 Quintals Value</div>
                  <div
                    style={{
                      ...styles.summaryValue,
                      color: "#ff8c00",
                      fontSize: "20px",
                    }}
                  >
                    ₹{(overallMaxPrice * 100).toLocaleString("en-IN")}
                  </div>
                  <div style={styles.summarySmall}>at peak price</div>
                </div>
              </div>
            </div>
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
  profitCard: {
    background: "linear-gradient(135deg, #f5f0ff 0%, #e8f0fe 100%)",
    border: "2px solid #ffd700",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "24px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  profitHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "16px",
  },
  profitIcon: {
    fontSize: "28px",
  },
  profitTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#333",
  },
  profitGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    marginBottom: "16px",
  },
  profitItem: {
    textAlign: "center",
  },
  profitLabel: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "4px",
  },
  profitValue: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
  },
  profitValueHighlight: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#ff8c00",
  },
  profitValueLoss: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#e53935",
  },
  profitBadge: {
    background: "#ffd700",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
    display: "inline-block",
    marginTop: "4px",
  },
  profitSmall: {
    fontSize: "12px",
    color: "#999",
    marginTop: "2px",
  },
  profitAdvice: {
    background: "white",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#555",
    borderLeft: "4px solid #ffd700",
  },
  bestDayBadge: {
    background: "#ffd700",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    marginLeft: "12px",
  },
  starBadge: {
    fontSize: "14px",
    marginLeft: "4px",
  },
  summaryCard: {
    marginTop: "24px",
    padding: "20px",
    background: "#f8f9fa",
    borderRadius: "12px",
    border: "1px solid #e0e0e0",
  },
  summaryTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "16px",
    color: "#333",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    textAlign: "center",
  },
  summaryLabel: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "4px",
  },
  summaryValue: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
  },
  summarySmall: {
    fontSize: "12px",
    color: "#999",
    marginTop: "2px",
  },
};
