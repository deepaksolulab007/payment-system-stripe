import React, { useEffect, useState } from "react";
import API from "../../utils/api";
import AdminLayout from "../../components/AdminLayout";

export default function WebhookLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    try {
      const res = await API.get("/webhook/logs");
      setLogs(res.data.reverse());  // newest first
    } catch (err) {
      console.error("Failed to fetch webhook logs", err);
      alert("Error fetching webhook logs");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <AdminLayout>
      <h1>Webhook Events</h1>

      <button 
        style={{ marginBottom: "20px", padding: "6px 12px" }} 
        onClick={loadLogs}
      >
        Refresh Logs
      </button>

      {loading ? (
        <p>Loading logs...</p>
      ) : logs.length === 0 ? (
        <p>No webhook events yet.</p>
      ) : (
        logs.map((event, idx) => (
          <pre
            key={idx}
            style={{
              background: "#f5f5f5",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
              border: "1px solid #ddd",
            }}
          >
{JSON.stringify(event, null, 2)}
          </pre>
        ))
      )}
    </AdminLayout>
  );
}
