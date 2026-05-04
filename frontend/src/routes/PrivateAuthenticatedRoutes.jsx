import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { CartaoOverlayReturnFocusProvider } from "../context/CartaoOverlayReturnFocusContext";

import HomePage from "../pages/home/HomePage";
import AssistenteCriacaoPage from "../pages/AssistenteCriacaoPage";
import OrganizacoesPage from "../pages/organizacoes/OrganizacoesPage";
import OrganizacaoDetalhePage from "../pages/organizacoes/OrganizacaoDetalhePage";
import OrganizacaoMembrosPage from "../pages/organizacoes/OrganizacaoMembrosPage";
import OrganizacaoConfiguracoesPage from "../pages/organizacoes/OrganizacaoConfiguracoesPage";
import QuadrosPage from "../pages/quadros/QuadrosPage";
import QuadroDetalhePage from "../pages/quadros/QuadroDetalhePage";
import QuadroConfiguracoesPage from "../pages/quadros/QuadroConfiguracoesPage";
import ConsultaCnpjPage from "../pages/quadros/ConsultaCnpjPage";
import ConsultaCnpjOverlay from "../pages/quadros/ConsultaCnpjOverlay";
import ConsultaEnderecoPage from "../pages/quadros/ConsultaEnderecoPage";
import ConsultaEnderecoOverlay from "../pages/quadros/ConsultaEnderecoOverlay";
import QuadroMembrosPage from "../pages/quadros/QuadroMembrosPage";
import QuadroPapeisPage from "../pages/quadros/QuadroPapeisPage";
import ListaConfiguracoesPage from "../pages/listas/ListaConfiguracoesPage";
import ListaEditorFullPage from "../pages/listas/ListaEditorFullPage";
import ListaEditorOverlay from "../pages/listas/ListaEditorOverlay";
import ListaPermissoesPage from "../pages/listas/ListaPermissoesPage";
import ListaTransicoesPage from "../pages/listas/ListaTransicoesPage";
import VisoesPage from "../pages/visoes/VisoesPage";
import VisaoFormPage from "../pages/visoes/VisaoFormPage";
import CamposPersonalizadosPage from "../pages/configuracoes/CamposPersonalizadosPage";
import AutomacoesPage from "../pages/automacoes/AutomacoesPage";
import AutomacaoFormPage from "../pages/automacoes/AutomacaoFormPage";
import CartaoDetalhePage from "../pages/cartoes/CartaoDetalhePage";
import CartaoDetalheOverlay from "../pages/cartoes/CartaoDetalheOverlay";

function overlayBackgroundFromState(state) {
  if (state == null || typeof state !== "object") return undefined;
  return state.background;
}

export default function PrivateAuthenticatedRoutes() {
  const location = useLocation();
  const background = overlayBackgroundFromState(location.state);

  return (
    <CartaoOverlayReturnFocusProvider>
      <Routes location={background ?? location}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/assistente-criacao" element={<AssistenteCriacaoPage />} />
        <Route
          path="/assistente"
          element={<Navigate to="/assistente-criacao" replace />}
        />

        <Route path="/organizacoes" element={<OrganizacoesPage />} />
        <Route
          path="/organizacoes/:organizacaoId/membros"
          element={<OrganizacaoMembrosPage />}
        />
        <Route
          path="/organizacoes/:organizacaoId/configuracoes"
          element={<OrganizacaoConfiguracoesPage />}
        />
        <Route
          path="/organizacoes/:organizacaoId/quadros"
          element={<QuadrosPage />}
        />
        <Route
          path="/organizacoes/:organizacaoId"
          element={<OrganizacaoDetalhePage />}
        />

        <Route path="/quadros" element={<QuadrosPage />} />

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
          path="/quadros/:quadroId/consultas/cnpj"
          element={<ConsultaCnpjPage />}
        />
        <Route
          path="/quadros/:quadroId/consultas/endereco"
          element={<ConsultaEnderecoPage />}
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
          path="/quadros/:quadroId/listas/nova"
          element={<ListaEditorFullPage modo="criar" />}
        />
        <Route
          path="/quadros/:quadroId/listas/:listaId/editar"
          element={<ListaEditorFullPage modo="editar" />}
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
        <Route
          path="/quadros/:quadroId/campos-personalizados"
          element={<CamposPersonalizadosPage />}
        />
        <Route
          path="/quadros/:quadroId/automacoes"
          element={<AutomacoesPage />}
        />
        <Route
          path="/quadros/:quadroId/automacoes/nova"
          element={<AutomacaoFormPage />}
        />
        <Route
          path="/quadros/:quadroId/automacoes/:automacaoId/editar"
          element={<AutomacaoFormPage />}
        />

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>

      {background ? (
        <Routes location={location}>
          <Route
            path="/quadros/:quadroId/cartoes/:cartaoId"
            element={<CartaoDetalheOverlay />}
          />
          <Route
            path="/quadros/:quadroId/consultas/cnpj"
            element={<ConsultaCnpjOverlay />}
          />
          <Route
            path="/quadros/:quadroId/consultas/endereco"
            element={<ConsultaEnderecoOverlay />}
          />
          <Route
            path="/quadros/:quadroId/listas/nova"
            element={<ListaEditorOverlay modo="criar" />}
          />
          <Route
            path="/quadros/:quadroId/listas/:listaId/editar"
            element={<ListaEditorOverlay modo="editar" />}
          />
        </Routes>
      ) : null}
    </CartaoOverlayReturnFocusProvider>
  );
}
