import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import "./Subscription.css";

export default function Subscription() {
  const [products, setProducts] = useState([]);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [oneTime, setOneTime] = useState(false);

  useEffect(() => {
    loadProductsAndPrices();
  }, []);

  const loadProductsAndPrices = async () => {
    try {
      const [productsRes, pricesRes] = await Promise.all([
        api.get("/subscription/products"),
        api.get("/subscription/prices"),
      ]);

      setProducts(productsRes.data.data || []);
      setPrices(pricesRes.data.data || []);
    } catch (err) {
      console.error("Failed to load products/prices", err);
    }
    setLoading(false);
  };

  const handleSubscribe = async (priceId) => {
    if (!email) {
      alert("Please enter your email address");
      return;
    }

    setProcessing(true);
    setSelectedPrice(priceId);

    try {
      const res = await api.post("/subscription/checkout", {
        email,
        priceId,
        oneTime, // Include one-time subscription option
      });

      // Redirect to Stripe Checkout
      window.location.href = res.data.url;
    } catch (err) {
      console.error("Checkout failed", err);
      alert("Failed to start checkout. Please try again.");
      setProcessing(false);
      setSelectedPrice(null);
    }
  };

  const formatPrice = (amount, currency, interval) => {
    const price = (amount / 100).toFixed(2);
    return `$${price}/${interval}`;
  };

  const getProductName = (productId) => {
    const product = products.find((p) => p.id === productId);
    return product?.name || "Unknown Plan";
  };

  if (loading) {
    return (
      <div className="subscription-page">
        <div className="loading">Loading plans...</div>
      </div>
    );
  }

  return (
    <div className="subscription-page">
      <div className="subscription-header">
        <h1>Choose Your Plan</h1>
        <p>Select a subscription plan that works best for you</p>
      </div>

      <div className="email-input-section">
        <label>Your Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div style={{ 
          marginTop: "15px", 
          display: "flex", 
          alignItems: "center", 
          gap: "10px",
          justifyContent: "center"
        }}>
          <input
            type="checkbox"
            id="oneTime"
            checked={oneTime}
            onChange={(e) => setOneTime(e.target.checked)}
            style={{ 
              width: "18px", 
              height: "18px", 
              cursor: "pointer" 
            }}
          />
          <label 
            htmlFor="oneTime" 
            style={{ 
              color: "#94a3b8", 
              cursor: "pointer",
              fontSize: "0.95rem"
            }}
          >
            One-time subscription (no auto-renewal)
          </label>
        </div>
      </div>

      {prices.length === 0 ? (
        <div className="no-plans">
          <p>No subscription plans available yet.</p>
          <p>Please ask the admin to create products and prices.</p>
        </div>
      ) : (
        <div className="plans-grid">
          {prices.map((price) => (
            <div
              key={price.id}
              className={`plan-card ${selectedPrice === price.id ? "selected" : ""}`}
            >
              <div className="plan-name">{getProductName(price.product)}</div>
              <div className="plan-price">
                {formatPrice(
                  price.unit_amount,
                  price.currency,
                  price.recurring?.interval
                )}
              </div>
              <div className="plan-interval">
                Billed {price.recurring?.interval}ly
              </div>
              <ul className="plan-features">
                <li>✓ Full access to all features</li>
                <li>✓ Priority support</li>
                <li>✓ Cancel anytime</li>
              </ul>
              <button
                className="subscribe-btn"
                onClick={() => handleSubscribe(price.id)}
                disabled={processing}
              >
                {processing && selectedPrice === price.id
                  ? "Processing..."
                  : "Subscribe Now"}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="subscription-footer">
        <p>
          Already have a subscription?{" "}
          <a href="/subscription/manage">Manage your subscription</a>
        </p>
        <p>
          <a href="/">← Back to Home</a>
        </p>
      </div>
    </div>
  );
}

