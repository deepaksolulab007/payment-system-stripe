import React, { useState } from "react";
import api from "../../utils/api";
import "./Subscription.css";

export default function SubscriptionManage() {
  const [email, setEmail] = useState("");
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const searchSubscriptions = async () => {
    if (!email) {
      alert("Please enter your email");
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const res = await api.get(`/subscription/by-email/${encodeURIComponent(email)}`);
      setSubscriptions(res.data || []);
    } catch (err) {
      console.error("Failed to fetch subscriptions", err);
      setSubscriptions([]);
    }

    setLoading(false);
  };

  const cancelSubscription = async (subscriptionId, immediately = false) => {
    const confirmMsg = immediately
      ? "Cancel immediately? You will lose access right away."
      : "Cancel at end of billing period? You'll keep access until then.";

    if (!window.confirm(confirmMsg)) return;

    setActionLoading(subscriptionId);

    try {
      await api.post("/subscription/cancel", {
        subscriptionId,
        cancelImmediately: immediately,
      });

      alert(
        immediately
          ? "Subscription canceled immediately"
          : "Subscription will cancel at the end of the billing period"
      );

      // Refresh subscriptions
      searchSubscriptions();
    } catch (err) {
      console.error("Failed to cancel subscription", err);
      alert("Failed to cancel subscription. Please try again.");
    }

    setActionLoading(null);
  };

  const resumeSubscription = async (subscriptionId) => {
    if (!window.confirm("Resume this subscription?")) return;

    setActionLoading(subscriptionId);

    try {
      await api.post("/subscription/resume", { subscriptionId });
      alert("Subscription resumed successfully!");
      searchSubscriptions();
    } catch (err) {
      console.error("Failed to resume subscription", err);
      alert("Failed to resume subscription. Please try again.");
    }

    setActionLoading(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAmount = (amount, currency) => {
    if (!amount) return "—";
    return `$${(amount / 100).toFixed(2)} ${currency?.toUpperCase() || ""}`;
  };

  const getStatusBadge = (status, cancelAtPeriodEnd) => {
    if (cancelAtPeriodEnd && status === "active") {
      return <span className="status-badge canceling">Canceling</span>;
    }

    const statusClasses = {
      active: "active",
      trialing: "trialing",
      canceled: "canceled",
      past_due: "past-due",
      unpaid: "unpaid",
    };

    return (
      <span className={`status-badge ${statusClasses[status] || "default"}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="subscription-page">
      <div className="subscription-header">
        <h1>Manage Subscriptions</h1>
        <p>View and manage your active subscriptions</p>
      </div>

      <div className="email-input-section">
        <label>Your Email</label>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && searchSubscriptions()}
          />
          <button
            className="search-btn"
            onClick={searchSubscriptions}
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {searched && (
        <div className="subscriptions-list">
          {subscriptions.length === 0 ? (
            <div className="no-plans">
              <p>No subscriptions found for this email.</p>
              <p>
                <a href="/subscription">Browse available plans</a>
              </p>
            </div>
          ) : (
            subscriptions.map((sub) => (
              <div key={sub.subscriptionId} className="subscription-card">
                <div className="sub-header">
                  <div className="sub-product">{sub.productName || "Subscription"}</div>
                  {getStatusBadge(sub.status, sub.cancelAtPeriodEnd)}
                </div>

                <div className="sub-details">
                  <div className="sub-detail">
                    <span className="label">Price:</span>
                    <span>{formatAmount(sub.amount, sub.currency)}/{sub.interval}</span>
                  </div>
                  <div className="sub-detail">
                    <span className="label">Current Period:</span>
                    <span>
                      {formatDate(sub.periodStart || sub.currentPeriodStart)} - {formatDate(sub.periodEnd || sub.currentPeriodEnd || sub.endedAt)}
                    </span>
                  </div>
                  {sub.trialEnd && new Date(sub.trialEnd) > new Date() && (
                    <div className="sub-detail">
                      <span className="label">Trial Ends:</span>
                      <span>{formatDate(sub.trialEnd)}</span>
                    </div>
                  )}
                  {sub.cancelAtPeriodEnd && (
                    <div className="sub-detail cancel-notice">
                      <span>⚠️ Cancels on {formatDate(sub.periodEnd || sub.currentPeriodEnd || sub.endedAt)}</span>
                    </div>
                  )}
                </div>

                <div className="sub-actions">
                  {sub.status === "active" && !sub.cancelAtPeriodEnd && (
                    <>
                      <button
                        className="action-btn cancel-end"
                        onClick={() => cancelSubscription(sub.subscriptionId, false)}
                        disabled={actionLoading === sub.subscriptionId}
                      >
                        Cancel at Period End
                      </button>
                      <button
                        className="action-btn cancel-now"
                        onClick={() => cancelSubscription(sub.subscriptionId, true)}
                        disabled={actionLoading === sub.subscriptionId}
                      >
                        Cancel Immediately
                      </button>
                    </>
                  )}
                  {sub.cancelAtPeriodEnd && sub.status === "active" && (
                    <button
                      className="action-btn resume"
                      onClick={() => resumeSubscription(sub.subscriptionId)}
                      disabled={actionLoading === sub.subscriptionId}
                    >
                      Resume Subscription
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="subscription-footer">
        <p>
          <a href="/subscription">← Back to Plans</a>
        </p>
        <p>
          <a href="/">← Back to Home</a>
        </p>
      </div>
    </div>
  );
}

