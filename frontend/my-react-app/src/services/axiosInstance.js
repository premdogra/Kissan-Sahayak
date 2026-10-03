// services/axiosInstance.js
// import axios from "axios";

// const API_URL =
//   import.meta.env.VITE_API_URL || "http://localhost:5000/api/auth";

// const axiosInstance = axios.create({
//   baseURL: API_URL,
// });

// // ✅ Attach token to every request automatically
// axiosInstance.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // ✅ If backend says 401 (token expired/invalid), clean up and redirect to login
// axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//       window.location.href = "/login"; // hard redirect, clears all state
//     }
//     return Promise.reject(error);
//   },
// );

// export default axiosInstance;

// axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api/auth", // ✅ hardcoded to test
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default axiosInstance;