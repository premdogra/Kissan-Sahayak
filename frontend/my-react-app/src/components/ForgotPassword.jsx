import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!identifier) {
      setError("Please enter email or mobile number");
      return;
    }

    setError("");
    setMessage("OTP sent successfully!");
  };

  return (
    <div style={styles.container}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <img src="/PawanLogo.jpg" alt="logo" style={styles.logo} />

        <h2 style={styles.title}>Forgot Password</h2>

        {error && <div style={styles.errorBox}>{error}</div>}
        {message && <div style={styles.successBox}>{message}</div>}

        <input
          type="text"
          placeholder="Enter Email or Mobile"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          style={styles.input}
        />

        <button type="submit" style={styles.submitBtn}>
          Send OTP
        </button>

        <button
          type="button"
          onClick={() => navigate("/login")}
          style={styles.backBtn}
        >
          Back to Login
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    background: "linear-gradient(135deg,#d7f5d9,#a8e6a3)",
    fontFamily: "Poppins, sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: "380px",
    background: "#fff",
    padding: "35px 30px",
    borderRadius: "16px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
    textAlign: "center",
  },

  logo: {
    height: "45px",
    marginBottom: "10px",
  },

  title: {
    color: "#1b5e20",
    marginBottom: "20px",
    fontWeight: "600",
  },

  input: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "25px",
    border: "1px solid #ddd",
    fontSize: "14px",
    marginBottom: "15px",
    outline: "none",
    fontFamily: "Poppins, sans-serif",
  },

  submitBtn: {
    width: "100%",
    padding: "12px",
    borderRadius: "25px",
    border: "none",
    background: "linear-gradient(45deg,#2e7d32,#4caf50)",
    color: "white",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
    marginBottom: "10px",
  },

  backBtn: {
    width: "100%",
    padding: "11px",
    borderRadius: "25px",
    border: "none",
    background: "#eeeeee",
    color: "#2e7d32",
    fontWeight: "500",
    cursor: "pointer",
  },

  errorBox: {
    background: "#fdecea",
    color: "#d32f2f",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "12px",
    fontSize: "13px",
  },

  successBox: {
    background: "#e8f5e9",
    color: "#2e7d32",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "12px",
    fontSize: "13px",
  },
};

export default ForgotPassword;
