import React from "react";
import "./LandingPage.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
// const LandingPage = () => (
//   <>
const LandingPage = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
    localStorage.setItem("lang", e.target.value);
  };

  return (
    <>
      {/* NAV */}
      <nav>
        <a className="logo" href="#">
          <img
            src="/PawanLogo.jpg"
            alt="Kisan Sahayak Logo"
            className="app-logo"
          />
          <div>
            <div className="logo-text">{t("Logotext")}</div>
            <div className="logo-sub">{t("sublogo")}</div>
          </div>
        </a>
        <ul className="nav-links">
          <li>
            <a href="#how">{t("nav1")}</a>
          </li>
          {/* <li><a href="#features">{t("nav2")}</a></li> */}
          <li>
            <a href="#market">{t("nav3")}</a>
          </li>
          <li>
            <a href="#for-you">{t("nav4")}</a>
          </li>
        </ul>
        <div className="nav-right">
          <Link to="/login" className="btn-outline">
            {t("login")}
          </Link>
          <Link to="/register" className="btn-fill">
            {t("register")}
          </Link>
          <Link to="/Feedback" className="btn-fill">
            {t("feedback")}
          </Link>

          <select
            onChange={changeLanguage}
            defaultValue={localStorage.getItem("lang") || "en"}
            style={{
              marginLeft: "10px",
              padding: "6px 10px",
              borderRadius: "20px",
              border: "1px solid #2e7d32",
              cursor: "pointer",
            }}
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="pa">ਪੰਜਾਬੀ</option>
          </select>
        </div>
      </nav>
      {/* LIVE PRICE TICKER */}
      <div className="ticker-bar">
        <div className="ticker-inner">
          <span className="ticker-item">{t("crop1")}</span>
          <span className="ticker-item">{t("crop2")}</span>
          <span className="ticker-item">{t("crop3")}</span>
          <span className="ticker-item">{t("crop4")}</span>
          <span className="ticker-item">{t("crop5")}</span>
          <span className="ticker-item">{t("crop6")}</span>
          <span className="ticker-item">{t("crop7")}</span>
          <span className="ticker-item">{t("crop8")}</span>
          <span className="ticker-item">{t("crop9")}</span>
          <span className="ticker-item">{t("crop10")}</span>
          <span className="ticker-item">{t("crop11")}</span>
          <span className="ticker-item">{t("crop12")}</span>
          <span className="ticker-item">{t("crop13")}</span>
          <span className="ticker-item">{t("crop14")}</span>
        </div>
      </div>
      {/* HERO */}
      <section className="hero">
        <div className="hero-content fade-up d1">
          <div className="hero-tag">🇮🇳 &nbsp;{t("H1")}</div>
          <h1>
            {t("heroTitle1")} <span className="hl">{t("price")}</span>{" "}
            {t("heroTitle2")}
          </h1>
          <p className="hero-desc">{t("H2")}</p>
          <div className="hero-btns">
            <a className="btn-hero-main" href="http://localhost:5173/login">
              🌾 {t("farmerBtn")}
            </a>
            <a className="btn-hero-sec" href="http://localhost:5173/login">
              🏪 {t("buyerBtn")}
            </a>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-num">50,000+</div>
              <div className="stat-lbl">{t("H3")}</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">12,000+</div>
              <div className="stat-lbl">{t("H4")}</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">₹38 Cr+</div>
              <div className="stat-lbl">{t("H5")}</div>
            </div>
          </div>
        </div>
        <div className="hero-visual fade-up d3">
          <div className="hero-card-mockup">
            <div className="mockup-header">
              <div className="live-dot" />
              <span className="mockup-title">
                {t("heroTitle1")} {t("price")}
              </span>
              <span className="mockup-sub">📍 {t("p1")}</span>
            </div>
            <div className="price-row">
              <div className="crop-name">{t("p2")}</div>
              <div className="crop-price">₹2,275/q</div>
              <div className="crop-change up">▲ 1.2%</div>
            </div>
            <div className="price-row">
              <div className="crop-name">{t("p3")}</div>
              <div className="crop-price">₹1,620/q</div>
              <div className="crop-change up">▲ 0.9%</div>
            </div>
            <div className="price-row">
              <div className="crop-name">{t("p4")}</div>
              <div className="crop-price">₹1,200/q</div>
              <div className="crop-change down">▼ 1.1%</div>
            </div>
            <div className="price-row">
              <div className="crop-name">{t("p5")}</div>
              <div className="crop-price">₹5,450/q</div>
              <div className="crop-change up">▲ 0.4%</div>
            </div>
          </div>
          <div className="mini-suggestion">
            <div className="icon">💡</div>
            <div>
              <strong>{t("s1")}</strong> {t("s2")}
              <strong>{t("s3")}</strong> {t("s4")}
            </div>
          </div>
        </div>
      </section>{" "}
      <section className="how" id="how">
        {/* <div className="section-tag">{t("sp0")}</div> */}
        <h2 className="section-title">{t("howWorksTitle")}</h2>
        <p className="section-desc">{t("sp1")}</p>
        <div className="steps-grid">
          <div className="step-card fade-up d1">
            <div className="step-num">1</div>
            <div className="step-icon">📱</div>
            <h3>{t("step1Title")}</h3>
            <p>{t("sp2")}</p>
          </div>
          <div className="step-card fade-up d2">
            <div className="step-num">2</div>
            <div className="step-icon">📊</div>
            <h3>{t("step2Title")}</h3>
            <p>{t("sp3")}</p>
          </div>
          <div className="step-card fade-up d3">
            <div className="step-num">3</div>
            <div className="step-icon">💡</div>
            <h3>{t("step3Title")}</h3>
            <p>{t("sp4")}</p>
          </div>
          <div className="step-card fade-up d4">
            <div className="step-num">4</div>
            <div className="step-icon">🤝</div>
            <h3>{t("step4Title")}</h3>
            <p>{t("sp5")}</p>
          </div>
        </div>
        {/* </section><section className="how" id="how"> */}
        {/* <div className="section-tag">{t("sp0")}</div> */}
        {/* <h2 className="section-title">{t("howWorksTitle")}</h2> */}
        {/* <p className="section-desc">{t("sp1")}</p> */}
        <div className="steps-grid">
          <div className="step-card fade-up d1">
            <div className="step-num">5</div>
            <div className="step-icon">⚖️</div>
            <h3>{t("step5Title")}</h3>
            <p>{t("sp6")}</p>
          </div>
          <div className="step-card fade-up d2">
            <div className="step-num">6</div>
            <div className="step-icon">📈</div>
            <h3>{t("step6Title")}</h3>
            <p>{t("sp7")}</p>
          </div>
          <div className="step-card fade-up d3">
            <div className="step-num">7</div>
            <div className="step-icon">📍</div>
            <h3>{t("step7Title")}</h3>
            <p>{t("sp8")}</p>
          </div>
          <div className="step-card fade-up d4">
            <div className="step-num">8</div>
            <div className="step-icon">📊</div>
            <h3>{t("step8Title")}</h3>
            <p>{t("sp9")}</p>
          </div>
        </div>
        <div className="steps-grid">
          <div className="step-card fade-up d1">
            <div className="step-num">9</div>
            <div className="step-icon">🏷️</div>
            <h3>{t("step9Title")}</h3>
            <p>{t("sp10")}</p>
          </div>
          <div className="step-card fade-up d2">
            <div className="step-num">10</div>
            <div className="step-icon">📈</div>
            <h3>{t("step10Title")}</h3>
            <p>{t("sp11")}</p>
          </div>
          <div className="step-card fade-up d3">
            <div className="step-num">11</div>
            <div className="step-icon">🗓️</div>
            <h3>{t("step11Title")}</h3>
            <p>{t("sp12")}</p>
          </div>
          <div className="step-card fade-up d4">
            <div className="step-num">12</div>
            <div className="step-icon">🤖</div>
            <h3>{t("step12Title")}</h3>
            <p>{t("sp13")}</p>
          </div>
        </div>
      </section>
      {/* FEATURES
    <section className="features" id="features">
      <div className="section-tag">{t("featuresNav")}</div>
      <h2 className="section-title">{t("featuresTitle")}</h2>
      <p className="section-desc">{t("f1")}</p>
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon fi-green">📈</div>
          <h3>{t("f2")}</h3>
          <p>{t("f3")}</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon fi-wheat">💡</div>
          <h3>{t("f4")}</h3>
          <p>{t("f5")}</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon fi-earth">🛒</div>
          <h3>{t("f6")}</h3>
          <p>{t("f7")}</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon fi-sky">☁️</div>
          <h3>{t("f8")}</h3>
          <p>{t("f9")}</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon fi-orange">💬</div>
          <h3>{t("f10")}</h3>
          <p>{t("f13")}</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon fi-pink">🏦</div>
          <h3>{t("f11")}</h3>
          <p>{t("f12")}</p>
        </div>
      </div>
    </section> */}
      {/* MARKETPLACE PREVIEW */}
      <section className="market" id="market">
        <div className="market-layout">
          <div className="market-cards">
            <div className="market-listing">
              <div className="listing-icon">🌾</div>
              <div className="listing-info">
                <h4>{t("stock1")}</h4>
                <div className="listing-meta">{t("stock2")}</div>
              </div>
              <div>
                <div className="listing-price">₹2,310/q</div>
                <div className="listing-badge badge-fresh">{t("stock3")}</div>
              </div>
            </div>
            <div className="market-listing">
              <div className="listing-icon">🍅</div>
              <div className="listing-info">
                <h4>{t("stock4")}</h4>
                <div className="listing-meta">{t("stock5")}</div>
              </div>
              <div>
                <div className="listing-price">₹1,900/q</div>
                <div className="listing-badge badge-bulk">{t("stock6")}</div>
              </div>
            </div>
            <div className="market-listing">
              <div className="listing-icon">🧅</div>
              <div className="listing-info">
                <h4>{t("stock7")}</h4>
                <div className="listing-meta">{t("stock8")}</div>
              </div>
              <div>
                <div className="listing-price">₹1,580/q</div>
                <div className="listing-badge badge-new">{t("stock9")}</div>
              </div>
            </div>
            <div className="market-listing">
              <div className="listing-icon">🥔</div>
              <div className="listing-info">
                <h4>{t("stock10")}</h4>
                <div className="listing-meta">{t("stock11")}</div>
              </div>
              <div>
                <div className="listing-price">₹1,180/q</div>
                <div className="listing-badge badge-fresh">{t("stock12")}</div>
              </div>
            </div>
          </div>

          <div className="market-text">
            <div className="section-tag">{t("dm1")}</div>
            <h2 className="section-title">
              {t("dm2")}
              <br />
              {t("dm3")}
            </h2>
            <p className="section-desc">{t("dm4")}</p>
            <ul className="market-list">
              <li>
                <span className="check">✅</span> {t("dm5")}
              </li>
              <li>
                <span className="check">✅</span> {t("dm6")}
              </li>
              <li>
                <span className="check">✅</span> {t("dm7")}
              </li>
              <li>
                <span className="check">✅</span> {t("dm8")}
              </li>
              <li>
                <span className="check">✅</span> {t("dm9")}
              </li>
            </ul>
            <Link
              to="/list-crop"
              className="btn-fill"
              style={{
                display: "inline-block",
                padding: ".8rem 2rem",
                fontSize: "1rem",
                fontFamily: "'Baloo 2', cursive",
                fontWeight: 700,
                borderRadius: "30px",
              }}
            >
              {t("dm10")}
            </Link>
          </div>
        </div>
      </section>
      {/* TESTIMONIALS */}
      <section className="testimonials">
        <div className="section-tag">{t("e1")}</div>
        <h2 className="section-title">{t("e2")}</h2>
        <p className="section-desc">{t("e3")}</p>
        <div className="testi-grid">
          <div className="testi-card">
            <div className="testi-quote">"</div>
            <p className="testi-text">{t("e4")}</p>
            <div className="testi-author">
              <div className="testi-avatar">👨‍🌾</div>
              <div>
                <div className="testi-name">{t("e5")}</div>
                <div className="testi-role">{t("e6")}</div>
              </div>
            </div>
          </div>
          <div className="testi-card">
            <div className="testi-quote">"</div>
            <p className="testi-text">{t("e7")}</p>
            <div className="testi-author">
              <div className="testi-avatar">👩‍🌾</div>
              <div>
                <div className="testi-name">{t("e8")}</div>
                <div className="testi-role">{t("e9")}</div>
              </div>
            </div>
          </div>
          <div className="testi-card">
            <div className="testi-quote">"</div>
            <p className="testi-text">{t("e10")}</p>
            <div className="testi-author">
              <div className="testi-avatar">👨‍🌾</div>
              <div>
                <div className="testi-name">{t("e11")}</div>
                <div className="testi-role">{t("e12")}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* WHO IS IT FOR */}
      <section className="audience" id="for-you">
        <div className="section-tag">{t("g1")}</div>
        <h2 className="section-title">{t("g2")}</h2>
        <p className="section-desc">{t("g3")}</p>
        <div className="audience-grid">
          <div className="audience-card farmer" data-emoji="🌾">
            <h3>{t("g4")}</h3>
            <p>{t("g5")}</p>
            <ul className="audience-list">
              <li>{t("g6")}</li>
              <li>{t("g7")}</li>
              <li>{t("g8")}</li>
              <li>{t("g9")}</li>
              <li>{t("g10")}</li>
            </ul>
          </div>
          <div className="audience-card buyer" data-emoji="🍽️">
            <h3>{t("g11")}</h3>
            <p>{t("g12")}</p>
            <ul className="audience-list">
              <li>{t("g13")}</li>
              <li>{t("g14")}</li>
              <li>{t("g15")}</li>
              <li>{t("g16")}</li>
              <li>{t("g17")}</li>
            </ul>
          </div>
        </div>
      </section>
      {/* CTA */}
      <section className="cta-section">
        <h2>{t("a1")}</h2>
        <p>{t("a2")}</p>
        <div className="cta-btns">
          <a className="btn-cta-white" href="http://localhost:5173/register">
            🌾 &nbsp;{t("a3")}
          </a>
          <a className="btn-cta-out" href="http://localhost:5173/register">
            🏪 &nbsp;{t("a4")}
          </a>
        </div>
      </section>
      {/* FOOTER */}
      <footer>
        <div className="footer-grid">
          <div className="footer-brand">
            <a
              className="logo"
              href="#"
              style={{ marginBottom: ".8rem", display: "inline-flex" }}
            >
              <div
                className="logo-icon"
                style={{ width: "38px", height: "38px", fontSize: "1.3rem" }}
              >
                🌾
              </div>
              <div>
                <div className="logo-text">{t("Logotext")}</div>
                <div className="logo-sub">{t("sublogo")}</div>
              </div>
            </a>
            <p>{t("fa1")}</p>
          </div>
          <div className="footer-col">
            <h4>{t("g4")}</h4>
            <ul>
              <li>
                <a href="#">{t("x1")}</a>
              </li>
              <li>
                <a href="#">{t("x2")}</a>
              </li>
              <li>
                <a href="#">{t("x3")}</a>
              </li>
              <li>
                <a href="#">{t("x4")}</a>
              </li>
              <li>
                <a href="#">{t("x5")}</a>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>{t("g11")}</h4>
            <ul>
              <li>
                <a href="#">{t("x6")}</a>
              </li>
              <li>
                <a href="#">{t("x7")}</a>
              </li>
              <li>
                <a href="#">{t("x8")}</a>
              </li>
              <li>
                <a href="#">{t("x9")}</a>
              </li>
              <li>
                <a href="#">{t("x10")}</a>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>{t("a5")}</h4>
            <ul>
              <li>
                <a href="#">{t("x11")}</a>
              </li>
              <li>
                <a href="#">{t("x12")}</a>
              </li>
              <li>
                <a href="#">{t("x13")}</a>
              </li>
              <li>
                <a href="#">{t("x14")}</a>
              </li>
              <li>
                <button onClick={() => i18n.changeLanguage("en")}>
                  English
                </button>
                {" | "}
                <button onClick={() => i18n.changeLanguage("hi")}>हिंदी</button>
                {" | "}
                <button onClick={() => i18n.changeLanguage("pa")}>
                  ਪੰਜਾਬੀ
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2025 FaslMandi. All rights reserved.</span>
          <span>🇮🇳 Made with ❤️ for Indian Farmers</span>
        </div>
      </footer>
    </>
  );
};

export default LandingPage;
