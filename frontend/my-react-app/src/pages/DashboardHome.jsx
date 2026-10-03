import { useAuth } from "../context/Authcontext";
import "../pages/Dashboard.css";

const QUICK_ACTIONS_FARMER = [
  {
    id: "forecast",
    icon: "📊",
    label: "Check Forecast",
    desc: "7-day AI price prediction",
  },
  {
    id: "trade",
    icon: "🤝",
    label: "Sell Your Crops",
    desc: "List & negotiate directly",
  },
  {
    id: "comparison",
    icon: "⚖️",
    label: "Compare Mandis",
    desc: "Find best market for your crop",
  },
  {
    id: "nearby",
    icon: "📍",
    label: "Find Nearby Mandis",
    desc: "Mandis near your location",
  },
  {
    id: "nearbyprices",
    icon: "🏷️",
    label: "Nearby Prices",
    desc: "Compare commodity prices",
  },
  {
    id: "mandiprice",
    icon: "💰",
    label: "Live Mandi Price",
    desc: "Check today's mandi price",
  },
  {
    id: "history",
    icon: "📈",
    label: "Price History",
    desc: "Last 7 days trend",
  },
  {
    id: "chat",
    icon: "🤖",
    label: "Ask AI Assistant",
    desc: "Hindi / Punjabi / English",
  },
];

const QUICK_ACTIONS_CUSTOMER = [
  {
    id: "forecast",
    icon: "📊",
    label: "Price Forecast",
    desc: "Plan your purchases wisely",
  },
  {
    id: "trade",
    icon: "🛒",
    label: "Buy from Farmers",
    desc: "Negotiate directly with farmers",
  },
  {
    id: "comparison",
    icon: "⚖️",
    label: "Compare Mandis",
    desc: "Find cheapest market near you",
  },
  {
    id: "nearby",
    icon: "📍",
    label: "Find Nearby Mandis",
    desc: "Mandis near your location",
  },
  {
    id: "nearbyprices",
    icon: "🏷️",
    label: "Nearby Prices",
    desc: "Compare commodity prices",
  },
  {
    id: "mandiprice",
    icon: "💰",
    label: "Live Mandi Price",
    desc: "Check today's mandi price",
  },
  {
    id: "history",
    icon: "📈",
    label: "Price History",
    desc: "Last 7 days price trend",
  },
  {
    id: "chat",
    icon: "🤖",
    label: "Ask AI Assistant",
    desc: "Hindi / Punjabi / English",
  },
];

const MARKET_SNAPSHOT = [
  { crop: "🌾 Wheat", price: "₹2,275/q", change: "+1.2%", up: true },
  { crop: "🥔 Potato", price: "₹1,200/q", change: "-0.8%", up: false },
  { crop: "🍅 Tomato", price: "₹1,900/q", change: "+2.1%", up: true },
  { crop: "🧅 Onion", price: "₹1,580/q", change: "+0.5%", up: true },
  { crop: "🍌 Banana", price: "₹1,800/q", change: "-1.1%", up: false },
  { crop: "🍊 Orange", price: "₹10,000/q", change: "+0.3%", up: true },
];

export default function DashboardHome({ onNavigate }) {
  const { user } = useAuth();
  const isFarmer = user?.role === "farmer";
  const actions = isFarmer ? QUICK_ACTIONS_FARMER : QUICK_ACTIONS_CUSTOMER;
  const greeting = getGreeting();

  return (
    <div>
      {/* WELCOME BANNER */}
      <div style={styles.welcomeBanner}>
        <div>
          <div style={styles.greet}>
            {greeting}, {user?.name?.split(" ")[0] || "there"}! 👋
          </div>
          <div style={styles.subGreet}>
            {isFarmer
              ? "Check today's mandi prices, AI forecasts, and sell your produce directly to buyers."
              : "Explore market prices, AI forecasts, and buy fresh produce directly from farmers."}
          </div>
        </div>
        <div style={styles.bannerIllustration}>{isFarmer ? "🌾" : "🛒"}</div>
      </div>

      {/* STATS ROW */}
      <div className="stat-grid" style={{ marginBottom: "1.75rem" }}>
        <div className="stat-card">
          <div className="stat-icon green">📊</div>
          <div className="stat-label">Today's Markets</div>
          <div className="stat-value">12,480+</div>
          <div className="stat-change up">↑ Active mandis</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">🌾</div>
          <div className="stat-label">Live Commodities</div>
          <div className="stat-value">340+</div>
          <div className="stat-change up">↑ Crops tracked</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">🤝</div>
          <div className="stat-label">
            {isFarmer ? "Active Buyers" : "Active Farmers"}
          </div>
          <div className="stat-value">8,200+</div>
          <div className="stat-change up">↑ On platform</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">📍</div>
          <div className="stat-label">Your District</div>
          <div className="stat-value">{user?.district || "Punjab"}</div>
          <div className="stat-change" style={{ color: "var(--gray-500)" }}>
            Ludhiana Region
          </div>
        </div>
      </div>

      <div className="two-col-wide" style={{ gap: "1.5rem" }}>
        {/* QUICK ACTIONS */}
        <div>
          <div className="page-header">
            <h1 style={{ fontSize: "1.2rem" }}>⚡ Quick Actions</h1>
          </div>
          <div style={styles.actionGrid}>
            {actions.map((a) => (
              <button
                key={a.id}
                style={styles.actionCard}
                onClick={() => onNavigate(a.id)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-3px)")
                }
                onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
              >
                <div style={styles.actionIcon}>{a.icon}</div>
                <div style={styles.actionLabel}>{a.label}</div>
                <div style={styles.actionDesc}>{a.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* MARKET SNAPSHOT */}
        <div>
          <div className="page-header">
            <h1 style={{ fontSize: "1.2rem" }}>💹 Market Snapshot</h1>
          </div>
          <div className="card" style={{ padding: "0.75rem 0" }}>
            <div
              style={{
                padding: "0 1rem 0.5rem",
                fontSize: "0.78rem",
                color: "var(--gray-500)",
                fontWeight: 600,
              }}
            >
              📍 Punjab • Today
            </div>
            {MARKET_SNAPSHOT.map((item, i) => (
              <div key={i} style={styles.snapshotRow}>
                <span style={styles.snapCrop}>{item.crop}</span>
                <span style={styles.snapPrice}>{item.price}</span>
                <span
                  style={{
                    ...styles.snapChange,
                    color: item.up ? "var(--green-main)" : "var(--red)",
                  }}
                >
                  {item.up ? "▲" : "▼"} {item.change}
                </span>
              </div>
            ))}
          </div>

          {/* FORECAST TIP */}
          <div style={styles.tipBox} onClick={() => onNavigate("forecast")}>
            <div style={styles.tipIcon}>💡</div>
            <div>
              <div style={styles.tipTitle}>
                AI Tip: Best time to sell Potato
              </div>
              <div style={styles.tipDesc}>
                Prices expected to rise 12% in 3 days. Consider waiting!
              </div>
            </div>
            <div style={styles.tipArrow}>→</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

const styles = {
  welcomeBanner: {
    background:
      "linear-gradient(135deg, #1b5e20 0%, #2e7d32 60%, #388e3c 100%)",
    borderRadius: "var(--radius-lg)",
    padding: "1.75rem 2rem",
    marginBottom: "1.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: "white",
    boxShadow: "0 4px 20px rgba(27,94,32,0.3)",
  },
  greet: {
    fontFamily: "'Baloo 2', cursive",
    fontSize: "1.5rem",
    fontWeight: 800,
    marginBottom: "0.4rem",
  },
  subGreet: {
    fontSize: "0.9rem",
    opacity: 0.85,
    maxWidth: "460px",
    lineHeight: 1.5,
  },
  bannerIllustration: { fontSize: "4rem", opacity: 0.9 },
  actionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "0.75rem",
  },
  actionCard: {
    background: "white",
    border: "1.5px solid var(--gray-200)",
    borderRadius: "var(--radius)",
    padding: "1rem",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease",
    boxShadow: "var(--shadow-sm)",
  },
  actionIcon: { fontSize: "1.5rem", marginBottom: "0.4rem" },
  actionLabel: {
    fontFamily: "'Baloo 2', cursive",
    fontWeight: 700,
    fontSize: "0.9rem",
    color: "var(--green-dark)",
    marginBottom: "0.2rem",
  },
  actionDesc: { fontSize: "0.75rem", color: "var(--gray-500)" },
  snapshotRow: {
    display: "flex",
    alignItems: "center",
    padding: "0.65rem 1rem",
    borderBottom: "1px solid var(--gray-100)",
    gap: "0.5rem",
  },
  snapCrop: {
    flex: 1,
    fontSize: "0.87rem",
    fontWeight: 600,
    color: "var(--gray-900)",
  },
  snapPrice: {
    fontFamily: "'Baloo 2', cursive",
    fontWeight: 800,
    fontSize: "0.95rem",
    color: "var(--green-dark)",
  },
  snapChange: {
    fontSize: "0.78rem",
    fontWeight: 700,
    minWidth: "60px",
    textAlign: "right",
  },
  tipBox: {
    marginTop: "1rem",
    background: "#fff8e1",
    border: "1.5px solid #ffcc02",
    borderRadius: "var(--radius)",
    padding: "1rem 1.2rem",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    cursor: "pointer",
    transition: "box-shadow 0.2s",
  },
  tipIcon: { fontSize: "1.5rem" },
  tipTitle: { fontWeight: 700, fontSize: "0.88rem", color: "var(--gray-900)" },
  tipDesc: { fontSize: "0.79rem", color: "var(--gray-600)", marginTop: "2px" },
  tipArrow: {
    marginLeft: "auto",
    fontSize: "1.1rem",
    color: "var(--gray-500)",
  },
};
