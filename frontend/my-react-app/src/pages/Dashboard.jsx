import { useState } from "react";
import { useAuth } from "../context/Authcontext";
import DashboardHome from "./DashboardHome";
import PriceForecast from "./PriceForecast";
import DirectTrade from "./DirectTrade";
import MandiComparison from "./MandiComparison";
import NearbyMandis from "./NearbyMandis";
import NearbyPrices from "./NearbyPrices";
import MandiPrice from "./MandiPrice";
import MandiHistory from "./MandiHistory";
import AIChat from "./AIChat";
import "./Dashboard.css";

const ALL_NAV = [
  { key: "home", label: "Home", icon: "🏠", roles: ["farmer", "customer"] },
  {
    key: "forecast",
    label: "Forecast",
    icon: "📊",
    roles: ["farmer", "customer"],
  },
  { key: "trade", label: "Trade", icon: "🤝", roles: ["farmer"] },
  { key: "trade", label: "Buy", icon: "🛒", roles: ["customer"] },
  {
    key: "mandiprice",
    label: "Mandi",
    icon: "🏪",
    roles: ["farmer", "customer"],
  },
  { key: "nearby", label: "Nearby", icon: "📍", roles: ["farmer", "customer"] },
  {
    key: "nearbyprices",
    label: "Prices",
    icon: "💰",
    roles: ["farmer", "customer"],
  },
  {
    key: "comparison",
    label: "Compare",
    icon: "⚖️",
    roles: ["farmer", "customer"],
  },
  {
    key: "history",
    label: "History",
    icon: "📈",
    roles: ["farmer", "customer"],
  },
  { key: "chat", label: "AI Chat", icon: "🤖", roles: ["farmer", "customer"] },
];

const BOTTOM_KEYS = ["home", "forecast", "trade", "mandiprice", "chat"];

const PAGES = {
  home: DashboardHome,
  forecast: PriceForecast,
  trade: DirectTrade,
  comparison: MandiComparison,
  nearby: NearbyMandis,
  nearbyprices: NearbyPrices,
  mandiprice: MandiPrice,
  history: MandiHistory,
  chat: AIChat,
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const role = user?.role || "customer";
  const [activePage, setActivePage] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);

  const PageComponent = PAGES[activePage] || DashboardHome;
  const navItems = ALL_NAV.filter((n) => n.roles.includes(role));
  const bottomTabs = navItems.filter((n) => BOTTOM_KEYS.includes(n.key));

  return (
    <div className="db-root">
      {/* TOP HEADER */}
      <header className="db-header">
        <div className="db-header-left">
          <span className="db-logo-icon">🌾</span>
          <span className="db-logo-text">Kisaan Sahayak</span>
        </div>
        <div className="db-header-right">
          <div className="db-user-pill">
            <span className="db-avatar">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </span>
            <div className="db-user-info">
              <span className="db-user-name">{user?.name || "User"}</span>
              <span className={"db-role-tag db-role-" + role}>
                {role === "farmer" ? "🌾 Farmer" : "🛒 Customer"}
              </span>
            </div>
          </div>
          <button className="db-logout-btn" onClick={logout} title="Logout">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      {/* HORIZONTAL NAV — desktop only */}
      <nav className="db-nav">
        <div className="db-nav-inner">
          {navItems.map((n) => (
            <button
              key={n.key + n.label}
              className={
                "db-nav-item" + (activePage === n.key ? " db-nav-active" : "")
              }
              onClick={() => setActivePage(n.key)}
            >
              <span className="db-nav-icon">{n.icon}</span>
              <span className="db-nav-label">{n.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* PAGE CONTENT */}
      <main className="db-content">
        <PageComponent onNavigate={setActivePage} />
      </main>

      {/* BOTTOM TAB BAR — mobile only */}
      <nav className="db-bottom-nav">
        {bottomTabs.map((n) => (
          <button
            key={n.key}
            className={
              "db-bottom-tab" +
              (activePage === n.key ? " db-bottom-active" : "")
            }
            onClick={() => setActivePage(n.key)}
          >
            <span className="db-bottom-icon">{n.icon}</span>
            <span className="db-bottom-label">{n.label}</span>
          </button>
        ))}
        <button
          className={"db-bottom-tab" + (menuOpen ? " db-bottom-active" : "")}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="db-bottom-icon">☰</span>
          <span className="db-bottom-label">More</span>
        </button>
      </nav>

      {/* MOBILE MORE SHEET */}
      {menuOpen && (
        <>
          <div
            className="db-sheet-backdrop"
            onClick={() => setMenuOpen(false)}
          />
          <div className="db-sheet">
            <div className="db-sheet-handle" />
            <div className="db-sheet-title">All Features</div>
            <div className="db-sheet-grid">
              {navItems.map((n) => (
                <button
                  key={n.key + n.label}
                  className={
                    "db-sheet-item" +
                    (activePage === n.key ? " db-sheet-active" : "")
                  }
                  onClick={() => {
                    setActivePage(n.key);
                    setMenuOpen(false);
                  }}
                >
                  <span className="db-sheet-icon">{n.icon}</span>
                  <span className="db-sheet-label">{n.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
