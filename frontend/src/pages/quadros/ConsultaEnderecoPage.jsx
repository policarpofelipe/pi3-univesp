import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import AppLayout from "../../components/layout/AppLayout";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import ConsultaEnderecoContent from "../../components/consultas/ConsultaEnderecoContent";
import useAuth from "../../hooks/useAuth";
import quadroService from "../../services/quadroService";
import { extractObject } from "../../utils/apiData";

import "../../styles/pages/consultas.css";

export default function ConsultaEnderecoPage() {
  const navigate = useNavigate();
  const { quadroId } = useParams();
  const { usuario } = useAuth();

  const [quadro, setQuadro] = useState(null);
  const [quadroErro, setQuadroErro] = useState("");
  const [carregandoQuadro, setCarregandoQuadro] = useState(true);

  const carregarQuadro = useCallback(async () => {
    if (!quadroId) return;
    setCarregandoQuadro(true);
    setQuadroErro("");
    try {
      const res = await quadroService.obterPorId(quadroId);
      setQuadro(extractObject(res) || res);
    } catch (err) {
      setQuadroErro(
        err?.response?.data?.message ||
          err?.message ||
          "Não foi possível carregar o quadro."
      );
      setQuadro(null);
    } finally {
      setCarregandoQuadro(false);
    }
  }, [quadroId]);

  useEffect(() => {
    carregarQuadro();
  }, [carregarQuadro]);

  function voltarConfig() {
    navigate(`/quadros/${quadroId}/configuracoes`);
  }

  if (carregandoQuadro) {
    return (
      <AppLayout
        title="Consultar endereço"
        subtitle="Carregando…"
        breadcrumbItems={[
          { label: "Início", href: "/home" },
          { label: "Quadros", href: "/quadros" },
          { label: "…" },
        ]}
        user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
      >
        <LoadingState title="Carregando quadro" />
      </AppLayout>
    );
  }

  if (quadroErro || !quadro) {
    return (
      <AppLayout
        title="Consultar endereço"
        subtitle="Erro"
        breadcrumbItems={[
          { label: "Início", href: "/home" },
          { label: "Quadros", href: "/quadros" },
        ]}
        user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
      >
        <ErrorState
          title="Não foi possível acessar esta página"
          description={quadroErro || "Quadro não encontrado."}
          action={
            <Button variant="primary" onClick={() => navigate("/quadros")}>
              Voltar aos quadros
            </Button>
          }
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Consultar endereço"
      subtitle="Endereço por CEP"
      breadcrumbItems={[
        { label: "Início", href: "/home" },
        { label: "Quadros", href: "/quadros" },
        { label: quadro.nome, href: `/quadros/${quadroId}` },
        { label: "Configurações", href: `/quadros/${quadroId}/configuracoes` },
        { label: "Consultar endereço" },
      ]}
      user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
    >
      <div className="consultas-page">
        <div className="consultas-page__back">
          <Button
            type="button"
            variant="secondary"
            leftIcon={<ArrowLeft size={16} aria-hidden="true" />}
            onClick={voltarConfig}
          >
            Voltar para Gerenciar quadro
          </Button>
        </div>

        <PageHeader
          title="Consultar endereço"
          description="Informe um CEP para buscar dados de endereço."
        />

        <p className="consultas-page__intro text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
          Esta consulta usa serviço externo gratuito para buscar endereço pelo CEP. Os
          dados não são salvos automaticamente no sistema.
        </p>

        <ConsultaEnderecoContent />
      </div>
    </AppLayout>
  );
}
