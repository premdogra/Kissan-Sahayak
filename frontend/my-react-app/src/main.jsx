import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// ✅ Existing imports — unchanged
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import Feedback from "./components/Feedback";
import ListCrop from "./components/ListCrop";
import ResetPassword from "./components/Resetpassword";

// 🆕 New imports
import { AuthProvider } from "./context/Authcontext";
import PrivateRoute from "./components/privateRoute";
import Dashboard from "./pages/Dashboard";

import "./i18n";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* ✅ All existing routes — completely unchanged */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/Feedback" element={<Feedback />} />
        <Route path="/list-crop" element={<ListCrop />} />

        {/* 🆕 Only new route added */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </AuthProvider>,
);
