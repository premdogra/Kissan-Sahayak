import React, { useState, useContext } from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { AuthContext } from "../context/Authcontext"; // 🆕

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // 🆕

  const [formData, setFormData] = useState({
    identifier: localStorage.getItem("rememberedIdentifier") || "",
    password: "",
    remember: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // authService.loginUser() already does:
      //   localStorage.setItem("token", ...)
      //   localStorage.setItem("user", ...)
      // and returns full response: { token, user: { id, name, role, ... } }
      const data = await loginUser(formData.identifier, formData.password); // 🆕 capture data

      // Remember me
      if (formData.remember) {
        localStorage.setItem("rememberedIdentifier", formData.identifier);
      } else {
        localStorage.removeItem("rememberedIdentifier");
      }

      login(data.user); // 🆕 sync user into React context (token already in localStorage)
      navigate("/dashboard"); // 🆕 redirect to dashboard instead of "/"
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Login failed. Please check your credentials.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Login Form</h2>
        </div>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            name="identifier"
            placeholder="Email or Mobile Number"
            value={formData.identifier}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <div className="options">
            <label>
              <input
                type="checkbox"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
                disabled={loading}
              />
              Remember me
            </label>
            <Link
              to="/ForgotPassword"
              className="forgot"
              style={{ pointerEvents: loading ? "none" : "auto" }}
            >
              Forgot password?
            </Link>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
          <p className="signup">
            Not a member? <Link to="/register">Signup now</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
