import { Link } from "react-router-dom";

export default function Failed() {
  return (
    <div style={{ textAlign: "center", paddingTop: "80px" }}>
      <h1 style={{ color: "red" }}>Payment Failed ❌</h1>
      <p>Something went wrong. Please try again.</p>

      <Link to="/">
        <button
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            background: "#f44336",
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
