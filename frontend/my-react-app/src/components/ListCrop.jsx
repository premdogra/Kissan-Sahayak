import React, { useState } from "react";

const ListCrop = () => {
  const [formData, setFormData] = useState({
    cropName: "",
    quantity: "",
    price: "",
    location: "",
    description: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Crop Listed Successfully!");
    console.log(formData);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>🌾 List Your Crop</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          name="cropName"
          placeholder="Crop Name (Wheat, Tomato...)"
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
          type="number"
          name="quantity"
          placeholder="Quantity (in quintal)"
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
          type="number"
          name="price"
          placeholder="Expected Price per quintal"
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
          type="text"
          name="location"
          placeholder="Village / District"
          onChange={handleChange}
          required
          style={styles.input}
        />

        <textarea
          name="description"
          placeholder="Additional Details"
          onChange={handleChange}
          style={styles.textarea}
        />

        <button type="submit" style={styles.button}>
          Submit Listing
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f5fbf6",
    padding: "60px 20px",
    textAlign: "center",
  },
  heading: {
    fontSize: "2rem",
    marginBottom: "30px",
    color: "#1e7e34",
  },
  form: {
    maxWidth: "400px",
    margin: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    background: "white",
    padding: "30px",
    borderRadius: "15px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  textarea: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    minHeight: "80px",
  },
  button: {
    padding: "12px",
    borderRadius: "25px",
    border: "none",
    background: "#1e7e34",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default ListCrop;
