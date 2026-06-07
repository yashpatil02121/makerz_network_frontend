import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  user,
  children,
}: any) {
  return user ? children : <Navigate to="/" />;
}