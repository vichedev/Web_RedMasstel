import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export function ProtectedRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-maastel-200 border-t-maastel-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Forzar cambio de contraseña antes de cualquier ruta del dashboard.
  if (
    user?.mustChangePassword &&
    !location.pathname.startsWith("/must-change-password")
  ) {
    return <Navigate to="/must-change-password" replace />;
  }

  return children;
}
