import { Link } from "react-router-dom";

export default function Success() {
  return (
    <div style={{ textAlign: "center", paddingTop: "80px" }}>
      <h1 style={{ color: "green" }}>Payment Successful 🎉</h1>
      <p>Your payment was processed successfully.</p>

      <Link to="/">
        <button
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            background: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Go Back Home
        </button>
      </Link>
    </div>
  );
}
