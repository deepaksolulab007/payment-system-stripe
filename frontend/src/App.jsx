import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// User pages
import Home from "./pages/User/Home";
import Success from "./pages/user/Success";
import Failed from "./pages/user/Failed";
import PaymentResult from "./pages/user/PaymentResult"

// Admin pages
import AdminLogin from "./pages/Admin/AdminLogin";
import Dashboard from "./pages/Admin/AdminDashboard";
import Payouts from "./pages/Admin/Payouts";
import Refunds from "./pages/Admin/Refunds";
import WebhookLogs from "./pages/Admin/WebhookLogs";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ---------- USER FLOW ---------- */}
        <Route path="/" element={<Home />} />
        <Route path="/success" element={<Success />} />
        <Route path="/failed" element={<Failed />} />
        <Route path="/payment-result" element={<PaymentResult />} />

        {/* ---------- ADMIN FLOW ---------- */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/payouts" element={<Payouts />} />
        <Route path="/admin/refunds" element={<Refunds />} />
        <Route path="/admin/webhook-logs" element={<WebhookLogs />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
