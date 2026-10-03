import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    district: "",
    state: "",
    mobile: "",
    userType: "Farmer",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Basic mobile validation
    if (!/^\d{10}$/.test(formData.mobile)) {
      setError("Mobile number must be exactly 10 digits.");
      setLoading(false);
      return;
    }

    try {
      await registerUser(formData);
      setSuccess("Registration successful! Redirecting...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Registration failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/ForgotPassword");
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <img
          src="/PawanLogo.jpg"
          alt="Kisan Sahayak Logo"
          style={{
            height: "40px",
            marginBottom: "10px",
            alignContent: "center",
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
        <h2 style={styles.title}> Registration</h2>

        {/* Error Message */}
        {error && <div style={styles.errorBox}>{error}</div>}

        {/* Success Message */}
        {success && <div style={styles.successBox}>{success}</div>}

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
          disabled={loading}
          style={styles.input}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={loading}
          style={styles.input}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={loading}
          style={styles.input}
        />

        {/* State Dropdown */}
        <select
          name="state"
          value={formData.state}
          onChange={handleChange}
          required
          disabled={loading}
          style={styles.input}
        >
          <option value="">Select State</option>
          <option value="Andhra Pradesh">Andhra Pradesh</option>
          <option value="Arunachal Pradesh">Arunachal Pradesh</option>
          <option value="Assam">Assam</option>
          <option value="Bihar">Bihar</option>
          <option value="Chhattisgarh">Chhattisgarh</option>
          <option value="Goa">Goa</option>
          <option value="Gujarat">Gujarat</option>
          <option value="Haryana">Haryana</option>
          <option value="Himachal Pradesh">Himachal Pradesh</option>
          <option value="Jharkhand">Jharkhand</option>
          <option value="Karnataka">Karnataka</option>
          <option value="Kerala">Kerala</option>
          <option value="Madhya Pradesh">Madhya Pradesh</option>
          <option value="Maharashtra">Maharashtra</option>
          <option value="Manipur">Manipur</option>
          <option value="Meghalaya">Meghalaya</option>
          <option value="Mizoram">Mizoram</option>
          <option value="Nagaland">Nagaland</option>
          <option value="Odisha">Odisha</option>
          <option value="Punjab">Punjab</option>
          <option value="Rajasthan">Rajasthan</option>
          <option value="Sikkim">Sikkim</option>
          <option value="Tamil Nadu">Tamil Nadu</option>
          <option value="Telangana">Telangana</option>
          <option value="Tripura">Tripura</option>
          <option value="Uttar Pradesh">Uttar Pradesh</option>
          <option value="Uttarakhand">Uttarakhand</option>
          <option value="West Bengal">West Bengal</option>
          <option value="Andaman and Nicobar Islands">
            Andaman and Nicobar Islands
          </option>
          <option value="Chandigarh">Chandigarh</option>
          <option value="Dadra and Nagar Haveli and Daman and Diu">
            Dadra and Nagar Haveli and Daman and Diu
          </option>
          <option value="Delhi">Delhi</option>
          <option value="Jammu and Kashmir">Jammu and Kashmir</option>
          <option value="Ladakh">Ladakh</option>
          <option value="Lakshadweep">Lakshadweep</option>
          <option value="Puducherry">Puducherry</option>
        </select>

        <input
          type="text"
          name="district"
          placeholder="District"
          value={formData.district}
          onChange={handleChange}
          required
          disabled={loading}
          style={styles.input}
        />

        <input
          type="tel"
          name="mobile"
          placeholder="Mobile Number"
          value={formData.mobile}
          onChange={handleChange}
          required
          disabled={loading}
          maxLength={10}
          style={styles.input}
        />

        <div style={styles.userTypeContainer}>
          <label>
            <b>Select User Type</b>
          </label>
          <div style={styles.radioGroup}>
            {["Farmer", "Customer"].map((type) => (
              <label
                key={type}
                style={{
                  ...styles.radioLabel,
                  background: formData.userType === type ? "#e8f5e9" : "white",
                  borderColor:
                    formData.userType === type ? "#4CAF50" : "#2c5364",
                  fontWeight: formData.userType === type ? "bold" : "normal",
                }}
              >
                <input
                  type="radio"
                  name="userType"
                  value={type}
                  checked={formData.userType === type}
                  onChange={handleChange}
                  disabled={loading}
                />{" "}
                {type}
              </label>
            ))}
          </div>
        </div>

        <button type="submit" style={styles.submitBtn} disabled={loading}>
          {loading ? "Registering..." : "Submit"}
        </button>

        <button
          type="button"
          onClick={handleForgotPassword}
          style={styles.forgotBtn}
          disabled={loading}
        >
          Forgot Password
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
    background: "linear-gradient(135deg, #d7f5d9, #a8e6a3)",
    fontFamily: "Poppins, sans-serif",
  },

  form: {
    width: "100%",
    maxWidth: "420px",
    background: "#ffffff",
    padding: "35px 30px",
    borderRadius: "16px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
    fontFamily: "Poppins, sans-serif",
  },

  title: {
    textAlign: "center",
    marginBottom: "18px",
    color: "#1b5e20",
    fontWeight: "600",
    fontSize: "22px",
  },

  errorBox: {
    backgroundColor: "#fdecea",
    color: "#d32f2f",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "12px",
    fontSize: "14px",
    border: "1px solid #f5c6cb",
  },

  successBox: {
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "12px",
    fontSize: "14px",
    border: "1px solid #c8e6c9",
  },

  input: {
    width: "100%",
    padding: "12px 16px",
    margin: "7px 0",
    borderRadius: "25px",
    border: "1px solid #ddd",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.3s ease",
    fontFamily: "Poppins, sans-serif",
  },

  userTypeContainer: {
    marginTop: "10px",
    marginBottom: "15px",
    fontFamily: "Poppins, sans-serif",
  },

  radioGroup: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginTop: "8px",
  },

  radioLabel: {
    padding: "8px 12px",
    borderRadius: "20px",
    border: "1px solid #ccc",
    cursor: "pointer",
    fontSize: "13px",
    transition: "0.3s",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontFamily: "Poppins, sans-serif",
  },

  submitBtn: {
    width: "100%",
    padding: "12px",
    borderRadius: "25px",
    border: "none",
    marginTop: "12px",
    background: "linear-gradient(45deg, #2e7d32, #4caf50)",
    color: "#fff",
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontFamily: "Poppins, sans-serif",
  },

  forgotBtn: {
    width: "100%",
    padding: "11px",
    borderRadius: "25px",
    border: "none",
    marginTop: "10px",
    background: "#eeeeee",
    color: "#2e7d32",
    fontWeight: "500",
    cursor: "pointer",
    transition: "0.3s",
    fontFamily: "Poppins, sans-serif",
  },
};
export default Register;
