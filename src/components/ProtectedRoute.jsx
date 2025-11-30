import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ role, children }) {
  const { userRole, token } = useAuth();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (role && role !== userRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
