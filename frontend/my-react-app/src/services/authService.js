// services/authService.js
import axiosInstance from "./axiosInstance";

// ─── Register ────────────────────────────────────────────────────────────────
export const registerUser = async (formData) => {
  const payload = {
    name: formData.username,
    email: formData.email,
    password: formData.password,
    mobile: formData.mobile,
    state: formData.state,
    district: formData.district,
    role: formData.userType.toLowerCase(),
  };
  const response = await axiosInstance.post("/register", payload);
  return response.data;
};

// ─── Login ───────────────────────────────────────────────────────────────────
export const loginUser = async (identifier, password) => {
  const response = await axiosInstance.post("/login", {
    identifier,
    password,
  });
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
  }
  return response.data;
};

// ─── Forgot Password ─────────────────────────────────────────────────────────
export const sendResetOTP = async (identifier) => {
  const response = await axiosInstance.post("/forgot-password", { identifier });
  return response.data;
};

// ─── Reset Password ──────────────────────────────────────────────────────────
export const verifyOTPAndReset = async (identifier, otp, newPassword) => {
  const response = await axiosInstance.post("/reset-password", {
    identifier,
    otp,
    newPassword,
  });
  return response.data;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const getToken = () => localStorage.getItem("token");
export const isAuthenticated = () => !!localStorage.getItem("token");