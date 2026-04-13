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
import ListaConfiguracoesPage from "./pages/listas/ListaConfiguracoesPage";
import ListaPermissoesPage from "./pages/listas/ListaPermissoesPage";
import ListaTransicoesPage from "./pages/listas/ListaTransicoesPage";
import VisoesPage from "./pages/visoes/VisoesPage";
import VisaoFormPage from "./pages/visoes/VisaoFormPage";

// Cartões
import CartaoDetalhePage from "./pages/cartoes/CartaoDetalhePage";

export default function App() {
  return (
    <AccessibilityProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<CadastroPage />} />
          <Route path="/esqueci-senha" element={<EsqueciSenhaPage />} />
          <Route path="/redefinir-senha" element={<RedefinirSenhaPage />} />

          <Route element={<PrivateRoute />}>
            <Route path="/home" element={<HomePage />} />

            <Route path="/organizacoes" element={<OrganizacoesPage />} />
            <Route
              path="/organizacoes/:organizacaoId"
              element={<OrganizacaoDetalhePage />}
            />

            <Route path="/quadros" element={<QuadrosPage />} />

            <Route
              path="/organizacoes/:organizacaoId/quadros"
              element={<QuadrosPage />}
            />

            <Route
              path="/quadros/:quadroId/cartoes/:cartaoId"
              element={<CartaoDetalhePage />}
            />
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
            <Route
              path="/quadros/:quadroId/listas/:listaId/configuracoes"
              element={<ListaConfiguracoesPage />}
            />
            <Route
              path="/quadros/:quadroId/listas/:listaId/permissoes"
              element={<ListaPermissoesPage />}
            />
            <Route
              path="/quadros/:quadroId/listas/:listaId/transicoes"
              element={<ListaTransicoesPage />}
            />
            <Route path="/quadros/:quadroId/visoes" element={<VisoesPage />} />
            <Route
              path="/quadros/:quadroId/visoes/nova"
              element={<VisaoFormPage />}
            />
            <Route
              path="/quadros/:quadroId/visoes/:visaoId/editar"
              element={<VisaoFormPage />}
            />
          </Route>

          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </AuthProvider>
    </AccessibilityProvider>
  );
}
