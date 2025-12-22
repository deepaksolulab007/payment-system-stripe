import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
      localStorage.setItem("admin-auth", "true");
      navigate("/admin/dashboard");
    } else {
      alert("Incorrect password");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      padding: "40px 20px",
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <div style={{
        background: "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)",
        border: "2px solid #334155",
        borderRadius: "16px",
        padding: "40px",
        maxWidth: "400px",
        width: "100%",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)"
      }}>
        <h1 style={{
          color: "#fff",
          textAlign: "center",
          marginBottom: "30px",
          fontSize: "2rem"
        }}>Admin Login</h1>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px",
              border: "2px solid #334155",
              borderRadius: "8px",
              background: "#1e293b",
              color: "#fff",
              fontSize: "1rem",
              transition: "border-color 0.3s"
            }}
            onFocus={(e) => e.target.style.borderColor = "#6366f1"}
            onBlur={(e) => e.target.style.borderColor = "#334155"}
          />

          <button 
            type="submit"
            style={{
              width: "100%",
              padding: "14px 24px",
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.02)";
              e.target.style.boxShadow = "0 8px 20px rgba(99, 102, 241, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "none";
            }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
