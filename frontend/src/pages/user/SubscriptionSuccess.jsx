import { Link, useSearchParams } from "react-router-dom";

export default function SubscriptionSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

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
        border: "2px solid #22c55e",
        boxShadow: "0 20px 40px rgba(34, 197, 94, 0.2)",
      }}>
        <div style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
          fontSize: "40px",
        }}>
          ✓
        </div>

        <h1 style={{ color: "#22c55e", marginBottom: "16px", fontSize: "2rem" }}>
          Subscription Activated! 🎉
        </h1>

        <p style={{ color: "#94a3b8", fontSize: "1.1rem", marginBottom: "32px" }}>
          Thank you for subscribing! Your subscription is now active and you have full access to all features.
        </p>

        {sessionId && (
          <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: "24px" }}>
            Session ID: {sessionId}
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Link to="/subscription/manage">
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
              Manage Subscription
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

