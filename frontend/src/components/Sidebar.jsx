import { Link } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Admin Panel</h2>

      <ul className="sidebar-menu">
        <li><Link to="/admin/dashboard">Dashboard</Link></li>
        <li><Link to="/admin/subscriptions">Subscriptions</Link></li>
        <li><Link to="/admin/payouts">Payouts</Link></li>
        <li><Link to="/admin/refunds">Refunds</Link></li>
      </ul>

      <button
        className="logout-btn"
        onClick={() => {
          localStorage.removeItem("adminAccess");
          window.location.href = "/";
        }}
      >
        Logout
      </button>
    </div>
  );
}
