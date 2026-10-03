import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyOTPAndReset } from "../services/authService";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // identifier passed from ForgotPassword page via navigate state
  const identifier = location.state?.identifier || "";

  const [formData, setFormData] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // If user lands here directly without going through ForgotPassword
  if (!identifier) {
    return (
      <div style={styles.container}>
        <div style={styles.form}>
          <h2 style={styles.title}>⚠️ Session Expired</h2>
          <p style={{ color: "#666", textAlign: "center" }}>
            Please go back and request a new OTP.
          </p>
          <button
            style={styles.button}
            onClick={() => navigate("/ForgotPassword")}
          >
            Go to Forgot Password
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await verifyOTPAndReset(identifier, formData.otp, formData.newPassword);
      setSuccess("✅ Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Invalid or expired OTP. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h2 style={styles.title}>🔑 Reset Password</h2>

        <p style={styles.subtitle}>
          OTP sent to: <b>{identifier}</b>
        </p>

        {error && <p style={styles.errorMsg}>{error}</p>}
        {success && <p style={styles.successMsg}>{success}</p>}

        <input
          type="text"
          name="otp"
          placeholder="Enter 6-digit OTP"
          value={formData.otp}
          onChange={handleChange}
          required
          disabled={loading}
          maxLength={6}
          style={styles.input}
        />

        <input
          type="password"
          name="newPassword"
          placeholder="New Password"
          value={formData.newPassword}
          onChange={handleChange}
          required
          disabled={loading}
          style={styles.input}
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm New Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          disabled={loading}
          style={styles.input}
        />

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <button
          type="button"
          style={styles.backBtn}
          onClick={() => navigate("/ForgotPassword")}
          disabled={loading}
        >
          Resend OTP
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

  form: {
    width: "100%",
    maxWidth: "420px",
    background: "#ffffff",
    padding: "clamp(25px, 4vw, 35px)",
    borderRadius: "16px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  title: {
    textAlign: "center",
    color: "#1b5e20",
    fontWeight: "600",
    fontSize: "clamp(20px, 3vw, 24px)",
    marginBottom: "5px",
  },

  subtitle: {
    textAlign: "center",
    color: "#555",
    fontSize: "clamp(13px, 2vw, 14px)",
    marginBottom: "10px",
  },

  input: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "25px",
    border: "1px solid #ddd",
    fontSize: "clamp(13px, 2vw, 14px)",
    outline: "none",
    transition: "all 0.3s ease",
    fontFamily: "Poppins, sans-serif",
  },

  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "25px",
    border: "none",
    marginTop: "5px",
    background: "linear-gradient(45deg,#2e7d32,#4caf50)",
    color: "#fff",
    fontWeight: "600",
    fontSize: "clamp(14px, 2vw, 15px)",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },

  backBtn: {
    width: "100%",
    padding: "11px",
    borderRadius: "25px",
    border: "none",
    marginTop: "5px",
    background: "#eeeeee",
    color: "#2e7d32",
    fontWeight: "500",
    fontSize: "clamp(13px, 2vw, 14px)",
    cursor: "pointer",
  },

  errorMsg: {
    background: "#fdecea",
    color: "#d32f2f",
    padding: "10px",
    borderRadius: "8px",
    fontSize: "13px",
    border: "1px solid #f5c6cb",
    textAlign: "center",
  },

  successMsg: {
    background: "#e8f5e9",
    color: "#2e7d32",
    padding: "10px",
    borderRadius: "8px",
    fontSize: "13px",
    border: "1px solid #c8e6c9",
    textAlign: "center",
  },
};
export default ResetPassword;
