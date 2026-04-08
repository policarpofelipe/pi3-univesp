import { Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { AccessibilityProvider } from "./context/AccessibilityContext";

import PrivateRoute from "./routes/PrivateRoute";

// Auth
import LoginPage from "./pages/auth/LoginPage";
import CadastroPage from "./pages/auth/CadastroPage";
import EsqueciSenhaPage from "./pages/auth/EsqueciSenhaPage";
import RedefinirSenhaPage from "./pages/auth/RedefinirSenhaPage";

// Core
import HomePage from "./pages/home/HomePage";

// Organizações
import OrganizacoesPage from "./pages/organizacoes/OrganizacoesPage";
import OrganizacaoDetalhePage from "./pages/organizacoes/OrganizacaoDetalhePage";

// Quadros
import QuadrosPage from "./pages/quadros/QuadrosPage";
import QuadroDetalhePage from "./pages/quadros/QuadroDetalhePage";
import QuadroConfiguracoesPage from "./pages/quadros/QuadroConfiguracoesPage";
import QuadroMembrosPage from "./pages/quadros/QuadroMembrosPage";
import QuadroPapeisPage from "./pages/quadros/QuadroPapeisPage";

export default function App() {
  return (
    <AccessibilityProvider>
      <AuthProvider>
        <Routes>

          {/* ROOT */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* PÚBLICO */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<CadastroPage />} />
          <Route path="/esqueci-senha" element={<EsqueciSenhaPage />} />
          <Route path="/redefinir-senha" element={<RedefinirSenhaPage />} />

          {/* PRIVADO */}
          <Route element={<PrivateRoute />}>

            {/* HOME */}
            <Route path="/home" element={<HomePage />} />

            {/* ORGANIZAÇÕES */}
            <Route path="/organizacoes" element={<OrganizacoesPage />} />

            <Route
              path="/organizacoes/:organizacaoId"
              element={<OrganizacaoDetalhePage />}
            />

            {/* QUADROS POR ORGANIZAÇÃO */}
            <Route
              path="/organizacoes/:organizacaoId/quadros"
              element={<QuadrosPage />}
            />

            {/* QUADRO DIRETO */}
            <Route path="/quadros/:quadroId" element={<QuadroDetalhePage />} />

            <Route
              path="/quadros/:quadroId/configuracoes"
              element={<QuadroConfiguracoesPage />}
            />

            <Route
              path="/quadros/:quadroId/membros"
              element={<QuadroMembrosPage />}
            />

            <Route
              path="/quadros/:quadroId/papeis"
              element={<QuadroPapeisPage />}
            />

          </Route>

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/home" replace />} />

        </Routes>
      </AuthProvider>
    </AccessibilityProvider>
  );
}
