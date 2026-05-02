import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import AppLayout from "./components/AppLayout.jsx";
import AdminOnly from "./components/AdminOnly.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import Compare from "./pages/Compare.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Home from "./pages/Home.jsx";
import Label from "./pages/Label.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import Login from "./pages/Login.jsx";
import Rubric from "./pages/Rubric.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1a1a24",
              color: "#f8fafc",
              border: "1px solid rgba(255,255,255,0.08)",
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<Home />} />
              <Route path="compare" element={<Compare />} />
              <Route path="rubric" element={<Rubric />} />
              <Route path="label" element={<Label />} />
              <Route
                path="dashboard"
                element={
                  <AdminOnly>
                    <Dashboard />
                  </AdminOnly>
                }
              />
              <Route path="leaderboard" element={<Leaderboard />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
);
