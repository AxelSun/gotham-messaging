import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const uid = sessionStorage.getItem("uid");

  if (!uid) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
