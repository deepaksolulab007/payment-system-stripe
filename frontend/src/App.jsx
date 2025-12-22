import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// User pages
import Home from "./pages/User/Home";
import Success from "./pages/user/Success";
import Failed from "./pages/user/Failed";
import PaymentResult from "./pages/user/PaymentResult";

// User subscription pages
import Subscription from "./pages/user/Subscription";
import SubscriptionManage from "./pages/user/SubscriptionManage";
import SubscriptionSuccess from "./pages/user/SubscriptionSuccess";
import SubscriptionCanceled from "./pages/user/SubscriptionCanceled";

// Admin pages
import AdminLogin from "./pages/Admin/AdminLogin";
import Dashboard from "./pages/Admin/AdminDashboard";
import Payouts from "./pages/Admin/Payouts";
import Refunds from "./pages/Admin/Refunds";
import WebhookLogs from "./pages/Admin/WebhookLogs";
import Subscriptions from "./pages/Admin/Subscriptions";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ---------- USER FLOW ---------- */}
        <Route path="/" element={<Home />} />
        <Route path="/success" element={<Success />} />
        <Route path="/failed" element={<Failed />} />
        <Route path="/payment-result" element={<PaymentResult />} />

        {/* ---------- USER SUBSCRIPTION FLOW ---------- */}
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/subscription/manage" element={<SubscriptionManage />} />
        <Route path="/subscription/success" element={<SubscriptionSuccess />} />
        <Route path="/subscription/canceled" element={<SubscriptionCanceled />} />

        {/* ---------- ADMIN FLOW ---------- */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/payouts" element={<Payouts />} />
        <Route path="/admin/refunds" element={<Refunds />} />
        <Route path="/admin/subscriptions" element={<Subscriptions />} />
        <Route path="/admin/webhook-logs" element={<WebhookLogs />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
