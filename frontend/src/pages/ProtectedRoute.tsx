import { Navigate } from "react-router-dom";

interface WrapperProp {
  children: React.ReactNode;
}
export function ProtectedRoute({ children }: WrapperProp) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/signin" />;
  }
  return children;
}
