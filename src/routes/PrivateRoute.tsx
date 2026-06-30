import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getToken } from "../services/authStorage";

type PrivateRouteProps = {
  children: ReactNode;
};

export function PrivateRoute({ children }: PrivateRouteProps) {
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
