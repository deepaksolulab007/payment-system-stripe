import { Link } from "react-router-dom";

export default function SubscriptionCanceled() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      padding: "20px",
    }}>
      <div style={{
        background: "rgba(30, 41, 59, 0.9)",
        borderRadius: "20px",
        padding: "60px 40px",
        textAlign: "center",
        maxWidth: "500px",
        border: "2px solid #f59e0b",
        boxShadow: "0 20px 40px rgba(245, 158, 11, 0.2)",
      }}>
        <div style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
          fontSize: "40px",
        }}>
          ✕
        </div>

        <h1 style={{ color: "#f59e0b", marginBottom: "16px", fontSize: "2rem" }}>
          Checkout Canceled
        </h1>

        <p style={{ color: "#94a3b8", fontSize: "1.1rem", marginBottom: "32px" }}>
          You've canceled the checkout process. No charges have been made to your account.
        </p>

        <p style={{ color: "#64748b", fontSize: "0.95rem", marginBottom: "24px" }}>
          Changed your mind? You can always come back and subscribe later.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Link to="/subscription">
            <button style={{
              width: "100%",
              padding: "14px 24px",
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
            }}>
              View Plans Again
            </button>
          </Link>

          <Link to="/">
            <button style={{
              width: "100%",
              padding: "14px 24px",
              background: "transparent",
              color: "#94a3b8",
              border: "2px solid #334155",
              borderRadius: "8px",
              fontSize: "1rem",
              cursor: "pointer",
            }}>
              Go to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

