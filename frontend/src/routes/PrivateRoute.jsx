import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

import "../styles/routes/private-route.css";

export default function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Estado intermediário: ainda não sabemos se está autenticado
  if (loading) {
    return (
      <div className="route-loading" role="status" aria-live="polite">
        <div className="route-loading__spinner" />
        <p className="route-loading__text">Verificando sessão...</p>
      </div>
    );
  }

  // Não autenticado → redireciona preservando origem
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Autenticado → libera rota protegida
  return <Outlet />;
}