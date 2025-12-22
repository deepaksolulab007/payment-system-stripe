import React, { useEffect, useState } from "react";
import API from "../../utils/api";
import AdminLayout from "../../components/AdminLayout";

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Product/Price creation
  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [priceAmount, setPriceAmount] = useState("");
  const [priceInterval, setPriceInterval] = useState("month");
  const [selectedProductId, setSelectedProductId] = useState("");
  
  const [products, setProducts] = useState([]);
  const [prices, setPrices] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subsRes, statsRes, productsRes, pricesRes] = await Promise.all([
        API.get("/subscription/all"),
        API.get("/subscription/stats"),
        API.get("/subscription/products"),
        API.get("/subscription/prices"),
      ]);

      setSubscriptions(subsRes.data || []);
      setStats(statsRes.data);
      setProducts(productsRes.data.data || []);
      setPrices(pricesRes.data.data || []);
    } catch (err) {
      console.error("Failed to load subscription data", err);
    }
    setLoading(false);
  };

  const createProduct = async () => {
    if (!productName) return alert("Product name is required");

    try {
      await API.post("/subscription/product/create", {
        name: productName,
        description: productDesc,
      });
      alert("Product created successfully!");
      setProductName("");
      setProductDesc("");
      loadData();
    } catch (err) {
      console.error("Failed to create product", err);
      alert("Error creating product");
    }
  };

  const createPrice = async () => {
    if (!selectedProductId || !priceAmount) {
      return alert("Select a product and enter amount");
    }

    try {
      await API.post("/subscription/price/create", {
        productId: selectedProductId,
        amount: Number(priceAmount),
        interval: priceInterval,
      });
      alert("Price created successfully!");
      setPriceAmount("");
      loadData();
    } catch (err) {
      console.error("Failed to create price", err);
      alert("Error creating price");
    }
  };

  const cancelSubscription = async (subscriptionId, immediately = false) => {
    const msg = immediately
      ? "Cancel immediately?"
      : "Cancel at period end?";
    if (!window.confirm(msg)) return;

    try {
      await API.post("/subscription/cancel", {
        subscriptionId,
        cancelImmediately: immediately,
      });
      alert("Subscription canceled");
      loadData();
    } catch (err) {
      console.error("Cancel failed", err);
      alert("Failed to cancel subscription");
    }
  };

  const archiveProduct = async (productId, productName) => {
    if (!window.confirm(`Deactivate "${productName}"? This will hide it from users but existing subscriptions will continue.`)) {
      return;
    }

    try {
      await API.post(`/subscription/product/archive/${productId}`);
      alert("Product deactivated successfully!");
      loadData();
    } catch (err) {
      console.error("Failed to archive product", err);
      alert("Error deactivating product");
    }
  };

  const archivePrice = async (priceId, priceAmount, currency, interval) => {
    const priceDisplay = `$${(priceAmount / 100).toFixed(2)}/${interval}`;
    if (!window.confirm(`Deactivate price "${priceDisplay}"? This will hide it from users but existing subscriptions will continue.`)) {
      return;
    }

    try {
      await API.post(`/subscription/price/archive/${priceId}`);
      alert("Price deactivated successfully!");
      loadData();
    } catch (err) {
      console.error("Failed to archive price", err);
      alert("Error deactivating price");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "—";
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return "—";
    }
  };

  const formatAmount = (amount, currency) => {
    if (!amount) return "—";
    return `$${(amount / 100).toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: "#22c55e",
      trialing: "#6366f1",
      canceled: "#ef4444",
      past_due: "#f97316",
      unpaid: "#ef4444",
    };
    return colors[status] || "#64748b";
  };

  return (
    <AdminLayout>
      <h1>Subscription Management</h1>

      {/* Stats Cards */}
      {stats && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "15px",
          marginBottom: "30px",
        }}>
          <div style={{ background: "#3498db", padding: "20px", borderRadius: "10px", textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>{stats.total}</div>
            <div>Total</div>
          </div>
          <div style={{ background: "#22c55e", padding: "20px", borderRadius: "10px", textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>{stats.active}</div>
            <div>Active</div>
          </div>
          <div style={{ background: "#6366f1", padding: "20px", borderRadius: "10px", textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>{stats.trialing}</div>
            <div>Trialing</div>
          </div>
          <div style={{ background: "#ef4444", padding: "20px", borderRadius: "10px", textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>{stats.canceled}</div>
            <div>Canceled</div>
          </div>
          <div style={{ background: "#f97316", padding: "20px", borderRadius: "10px", textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>{stats.pastDue}</div>
            <div>Past Due</div>
          </div>
        </div>
      )}

      {/* Create Product Section */}
      <div style={{ background: "#1e293b", padding: "20px", borderRadius: "10px", marginBottom: "20px" }}>
        <h3>Create New Product</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Product Name (e.g., Premium Plan)"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            style={{ padding: "8px", flex: "1", minWidth: "200px" }}
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={productDesc}
            onChange={(e) => setProductDesc(e.target.value)}
            style={{ padding: "8px", flex: "1", minWidth: "200px" }}
          />
          <button onClick={createProduct} style={{ padding: "8px 16px" }}>
            Create Product
          </button>
        </div>
      </div>

      {/* Create Price Section */}
      <div style={{ background: "#1e293b", padding: "20px", borderRadius: "10px", marginBottom: "20px" }}>
        <h3>Create Price for Product</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            style={{ padding: "8px", minWidth: "200px" }}
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Amount (in cents, e.g., 999 = $9.99)"
            value={priceAmount}
            onChange={(e) => setPriceAmount(e.target.value)}
            style={{ padding: "8px", width: "250px" }}
          />
          <select
            value={priceInterval}
            onChange={(e) => setPriceInterval(e.target.value)}
            style={{ padding: "8px" }}
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
          <button onClick={createPrice} style={{ padding: "8px 16px" }}>
            Create Price
          </button>
        </div>
      </div>

      {/* Existing Products & Prices */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
        <div style={{ background: "#1e293b", padding: "20px", borderRadius: "10px" }}>
          <h3>Products ({products.length})</h3>
          {products.length === 0 ? (
            <p style={{ color: "#64748b" }}>No products yet</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {products.map((p) => (
                <li key={p.id} style={{ padding: "8px 0", borderBottom: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong>{p.name}</strong>
                    <br />
                    <small style={{ color: "#64748b" }}>{p.id}</small>
                  </div>
                  <button
                    onClick={() => archiveProduct(p.id, p.name)}
                    style={{
                      padding: "6px 12px",
                      fontSize: "12px",
                      background: "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                    title="Deactivate this product (will hide from users)"
                  >
                    Deactivate
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ background: "#1e293b", padding: "20px", borderRadius: "10px" }}>
          <h3>Prices ({prices.length})</h3>
          {prices.length === 0 ? (
            <p style={{ color: "#64748b" }}>No prices yet</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {prices.map((p) => (
                <li key={p.id} style={{ padding: "8px 0", borderBottom: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong>{formatAmount(p.unit_amount, p.currency)}/{p.recurring?.interval}</strong>
                    <br />
                    <small style={{ color: "#64748b" }}>{p.id}</small>
                  </div>
                  <button
                    onClick={() => archivePrice(p.id, p.unit_amount, p.currency, p.recurring?.interval)}
                    style={{
                      padding: "6px 12px",
                      fontSize: "12px",
                      background: "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                    title="Deactivate this price (will hide from users)"
                  >
                    Deactivate
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Subscriptions Table */}
      <h3>All Subscriptions</h3>
      {loading ? (
        <p>Loading...</p>
      ) : subscriptions.length === 0 ? (
        <p style={{ color: "#64748b" }}>No subscriptions yet</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Subscription ID</th>
              <th>Customer Email</th>
              <th>Product</th>
              <th>Price</th>
              <th>Status</th>
              <th>Period End</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => (
              <tr key={sub.subscriptionId}>
                <td style={{ fontSize: "12px" }}>{sub.subscriptionId}</td>
                <td>{sub.customerEmail || "—"}</td>
                <td>{sub.productName || "—"}</td>
                <td>
                  {formatAmount(sub.amount, sub.currency)}/{sub.interval}
                </td>
                <td>
                  <span style={{
                    background: getStatusColor(sub.status) + "30",
                    color: getStatusColor(sub.status),
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}>
                    {sub.status}
                    {sub.cancelAtPeriodEnd && " (canceling)"}
                  </span>
                </td>
                <td>{formatDate(sub.periodEnd || sub.currentPeriodEnd || sub.endedAt)}</td>
                <td>
                  {sub.status === "active" && !sub.cancelAtPeriodEnd && (
                    <>
                      <button
                        onClick={() => cancelSubscription(sub.subscriptionId, false)}
                        style={{ marginRight: "5px", padding: "4px 8px", fontSize: "12px" }}
                      >
                        Cancel End
                      </button>
                      <button
                        onClick={() => cancelSubscription(sub.subscriptionId, true)}
                        style={{ padding: "4px 8px", fontSize: "12px", background: "#ef4444" }}
                      >
                        Cancel Now
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}

