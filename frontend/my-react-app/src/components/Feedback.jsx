import React, { useState } from "react";

const Feedback = () => {
  const [formData, setFormData] = useState({
    frequency: "",
    motivation: "",
    feature: "",
    improvement: "",
    followUp: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    alert("Feedback Submitted!");
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h3>👋 Help us improve</h3>
          <span style={styles.close}>✕</span>
        </div>

        <form onSubmit={handleSubmit}>
          <label>How often do you use our app?</label>
          <input
            type="text"
            name="frequency"
            placeholder="Everyday/once a week/bi-weekly"
            value={formData.frequency}
            onChange={handleChange}
            style={styles.input}
          />

          <label>What is the motivation to use our app?</label>
          <textarea
            name="motivation"
            placeholder="What problem does it solve for you?"
            value={formData.motivation}
            onChange={handleChange}
            style={styles.textarea}
          />

          <label>What is your most used feature?</label>
          <input
            type="text"
            name="feature"
            value={formData.feature}
            onChange={handleChange}
            style={styles.input}
          />

          <label>What would you like to see improved the most?</label>
          <input
            type="text"
            name="improvement"
            value={formData.improvement}
            onChange={handleChange}
            style={styles.input}
          />

          <div style={styles.checkboxContainer}>
            <input
              type="checkbox"
              name="followUp"
              checked={formData.followUp}
              onChange={handleChange}
            />
            <span style={{ marginLeft: "8px" }}>
              Receive personal follow-up to your feedback
            </span>
          </div>

          <button type="submit" style={styles.button}>
            Submit feedback
          </button>
        </form>

        <p style={styles.footer}>Powered by YourApp</p>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
  },
  card: {
    width: "400px",
    backgroundColor: "#ffffff",
    padding: "25px",
    borderRadius: "10px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  close: {
    cursor: "pointer",
    fontSize: "16px",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginTop: "6px",
    marginBottom: "15px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    marginTop: "6px",
    marginBottom: "15px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    minHeight: "70px",
    resize: "none",
  },
  checkboxContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "15px",
  },
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "black", // ✅ Black button
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    cursor: "pointer",
  },
  footer: {
    textAlign: "center",
    fontSize: "12px",
    marginTop: "15px",
    color: "#777",
  },
};

export default Feedback;
