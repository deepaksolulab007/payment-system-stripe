import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem("adminAccess") === "true";

  return isLoggedIn ? children : <Navigate to="/admin-login" replace />;
}
