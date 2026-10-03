import { useAuth } from "../context/Authcontext";
import "../pages/Dashboard.css";

const FARMER_NAV = [
  { id: "home", icon: "🏠", label: "Dashboard" },
  { id: "forecast", icon: "📊", label: "Price Forecast" },
  { id: "trade", icon: "🤝", label: "Direct Selling" },
  { id: "comparison", icon: "⚖️", label: "Mandi Comparison" },
  { id: "nearby", icon: "📍", label: "Nearby Mandis" },
  { id: "nearbyprices", icon: "🏷️", label: "Nearby Prices" },
  { id: "mandiprice", icon: "💰", label: "Mandi Price" },
  { id: "history", icon: "📈", label: "Price History" },
  { id: "chat", icon: "🤖", label: "AI Assistant" },
];

const CUSTOMER_NAV = [
  { id: "home", icon: "🏠", label: "Dashboard" },
  { id: "forecast", icon: "📊", label: "Price Forecast" },
  { id: "trade", icon: "🛒", label: "Direct Buying" },
  { id: "comparison", icon: "⚖️", label: "Mandi Comparison" },
  { id: "nearby", icon: "📍", label: "Nearby Mandis" },
  { id: "nearbyprices", icon: "🏷️", label: "Nearby Prices" },
  { id: "mandiprice", icon: "💰", label: "Mandi Price" },
  { id: "history", icon: "📈", label: "Price History" },
  { id: "chat", icon: "🤖", label: "AI Assistant" },
];

export default function Sidebar({
  activePage,
  setActivePage,
  sidebarOpen,
  setSidebarOpen,
  role,
}) {
  const { logout } = useAuth();
  const nav = role === "farmer" ? FARMER_NAV : CUSTOMER_NAV;

  return (
    <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
      <div
        className="sidebar-logo"
        onClick={() => setSidebarOpen((o) => !o)}
        style={{ cursor: "pointer" }}
      >
        <div className="sidebar-logo-icon">🌾</div>
        <div className="sidebar-logo-text">Kisaan Sahayak</div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">
          {role === "farmer" ? "Farmer Tools" : "Buyer Tools"}
        </div>
        {nav.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activePage === item.id ? "active" : ""}`}
            onClick={() => setActivePage(item.id)}
            title={!sidebarOpen ? item.label : ""}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          className="logout-btn"
          onClick={logout}
          title={!sidebarOpen ? "Logout" : ""}
        >
          <span className="nav-icon">🚪</span>
          <span className="nav-label">Logout</span>
        </button>
      </div>
    </aside>
  );
}
