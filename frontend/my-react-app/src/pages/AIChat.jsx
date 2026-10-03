import { useState, useRef, useEffect } from "react";
import "../pages/Dashboard.css";

const BASE = "http://localhost:5000";

const SUGGESTIONS = [
  "Price of Potato in Ludhiana",
  "लुधियाना में केले का भाव क्या है?",
  "Predict price of Wheat in Amritsar",
  "ਨੇੜੇ ਦੀਆਂ ਮੰਡੀਆਂ ਦੱਸੋ",
  "Sell or wait for Onion?",
  "Best mandi for Tomato near Jalandhar",
];

const LANGS = [
  { code: "auto", label: "Auto Detect" },
  { code: "en-IN", label: "English" },
  { code: "hi-IN", label: "हिंदी" },
  { code: "pa-IN", label: "ਪੰਜਾਬੀ" },
];

export default function AIChat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Namaste! 🌾 I'm your Kisaan AI assistant. Ask me about mandi prices, price forecasts, best time to sell, nearby mandis — in Hindi, Punjabi, or English!",
      time: now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [lang, setLang] = useState("auto");
  const [loading, setLoading] = useState(false);
  const [includeVoice, setIncludeVoice] = useState(false);
  const [audioSrc, setAudioSrc] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg = { role: "user", content: msg, time: now() };
    const history = [
      ...messages.filter(
        (m) => m.role !== "assistant" || messages.indexOf(m) > 0,
      ),
      userMsg,
    ];

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setAudioSrc(null);

    try {
      const res = await fetch(`${BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          language: lang,
          include_voice: includeVoice,
          include_forecast: true,
          include_nearby: true,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Chat failed");

      const assistantMsg = {
        role: "assistant",
        content: json.response,
        time: now(),
        detected_language: json.detected_language,
        forecast_data: json.forecast_data,
      };
      setMessages((prev) => [...prev, assistantMsg]);

      if (json.audio) {
        const bytes = Uint8Array.from(atob(json.audio), (c) => c.charCodeAt(0));
        const blob = new Blob([bytes], { type: "audio/wav" });
        setAudioSrc(URL.createObjectURL(blob));
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ Error: ${e.message}. Please check if the server is running.`,
          time: now(),
        },
      ]);
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>🤖 AI Assistant</h1>
        <p>Ask about prices, forecasts & mandis in Hindi, Punjabi or English</p>
      </div>

      <div className="two-col-wide" style={{ gap: "1.25rem" }}>
        {/* CHAT PANEL */}
        <div
          className="card"
          style={{
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 220px)",
          }}
        >
          {/* LANG + VOICE OPTIONS */}
          <div style={styles.chatOptions}>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  className={`lang-chip ${lang === l.code ? "active" : ""}`}
                  onClick={() => setLang(l.code)}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <label style={styles.voiceToggle}>
              <input
                type="checkbox"
                checked={includeVoice}
                onChange={(e) => setIncludeVoice(e.target.checked)}
              />
              🔊 Voice
            </label>
          </div>

          {/* MESSAGES */}
          <div className="chat-messages" style={{ flex: 1 }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: m.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                {m.role === "assistant" && (
                  <div style={styles.botLabel}>
                    🤖 Kisaan AI
                    {m.detected_language ? ` • ${m.detected_language}` : ""}
                  </div>
                )}
                <div
                  className={`msg-bubble ${m.role}`}
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {m.content}
                  {m.forecast_data?.recommendation && (
                    <div style={styles.inlineForecast}>
                      <strong>
                        {m.forecast_data.recommendation.action === "SELL"
                          ? "✅ SELL NOW"
                          : "⏳ WAIT"}
                      </strong>
                      {" • "}Best: {m.forecast_data.recommendation.best_market}
                      {" • "}₹
                      {m.forecast_data.recommendation.expected_price?.toLocaleString(
                        "en-IN",
                      )}
                      /q
                    </div>
                  )}
                </div>
                <div className="msg-time">{m.time}</div>
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: "flex-start" }}>
                <div style={styles.botLabel}>🤖 Kisaan AI</div>
                <div className="msg-bubble assistant">
                  <div style={styles.typingDots}>
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* AUDIO PLAYER */}
          {audioSrc && (
            <div style={styles.audioBar}>
              🔊 Voice response ready:
              <audio
                controls
                src={audioSrc}
                style={{ height: "32px", flex: 1 }}
              />
            </div>
          )}

          {/* INPUT */}
          <div className="chat-input-row">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type in Hindi, Punjabi or English..."
              disabled={loading}
            />
            <button
              className="chat-send-btn"
              onClick={() => send()}
              disabled={loading || !input.trim()}
            >
              {loading ? "⏳" : "➤"}
            </button>
          </div>
        </div>

        {/* SIDEBAR: SUGGESTIONS + TIPS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="card">
            <div className="card-title">💬 Try These Questions</div>
            {SUGGESTIONS.map((s, i) => (
              <button key={i} style={styles.suggBtn} onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>

          <div className="card">
            <div className="card-title">✨ Capabilities</div>
            {[
              ["🌾", "Live mandi prices"],
              ["📊", "7-day price forecasts"],
              ["⚖️", "Buy or wait recommendations"],
              ["📍", "Nearby mandi finder"],
              ["🗣️", "Hindi, Punjabi & English"],
              ["🔊", "Voice responses"],
            ].map(([icon, label], i) => (
              <div key={i} style={styles.capRow}>
                <span>{icon}</span>
                <span style={{ fontSize: "0.85rem", color: "var(--gray-700)" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function now() {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const styles = {
  chatOptions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "0.5rem",
    paddingBottom: "0.75rem",
    borderBottom: "1px solid var(--gray-200)",
    marginBottom: "0.75rem",
  },
  voiceToggle: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    fontSize: "0.83rem",
    fontWeight: 600,
    color: "var(--gray-700)",
    cursor: "pointer",
  },
  botLabel: {
    fontSize: "0.72rem",
    color: "var(--gray-500)",
    fontWeight: 600,
    marginBottom: "3px",
    marginLeft: "4px",
  },
  inlineForecast: {
    marginTop: "0.6rem",
    padding: "0.5rem 0.75rem",
    background: "rgba(255,255,255,0.15)",
    borderRadius: "8px",
    fontSize: "0.8rem",
    borderLeft: "3px solid rgba(255,255,255,0.5)",
  },
  typingDots: {
    display: "flex",
    gap: "4px",
    alignItems: "center",
    padding: "4px 0",
  },
  audioBar: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.6rem 0.75rem",
    background: "var(--green-pale)",
    borderRadius: "var(--radius)",
    marginBottom: "0.75rem",
    fontSize: "0.83rem",
    fontWeight: 600,
    color: "var(--green-dark)",
  },
  suggBtn: {
    display: "block",
    width: "100%",
    textAlign: "left",
    padding: "0.55rem 0.85rem",
    marginBottom: "0.4rem",
    background: "var(--gray-50)",
    border: "1px solid var(--gray-200)",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.83rem",
    color: "var(--gray-700)",
    fontFamily: "'Noto Sans', sans-serif",
    transition: "all 0.2s",
    lineHeight: 1.4,
  },
  capRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.65rem",
    padding: "0.45rem 0",
    borderBottom: "1px solid var(--gray-100)",
    fontSize: "1rem",
  },
};
