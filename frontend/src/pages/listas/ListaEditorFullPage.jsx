import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import AppLayout from "../../components/layout/AppLayout";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import ListaEditorSurface from "../../components/listas/ListaEditorSurface";
import useAuth from "../../hooks/useAuth";
import quadroService from "../../services/quadroService";
import { extractObject } from "../../utils/apiData";

/** Página cheia: criar ou editar lista (URL direta, sem overlay). */
export default function ListaEditorFullPage({ modo = "criar" }) {
  const navigate = useNavigate();
  const { quadroId } = useParams();
  const { usuario } = useAuth();
  const [quadro, setQuadro] = useState(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!quadroId) return;
      try {
        const res = await quadroService.obterPorId(quadroId);
        const data = extractObject(res) || res;
        if (!cancel) setQuadro(data);
      } catch {
        if (!cancel) setQuadro(null);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [quadroId]);

  const voltarQuadro = useCallback(() => {
    navigate(`/quadros/${quadroId}`);
  }, [navigate, quadroId]);

  const titulo = modo === "criar" ? "Nova lista" : "Editar lista";
  const descricao =
    modo === "criar"
      ? "Defina nome, cor e limite WIP da nova coluna do quadro."
      : "Atualize os dados desta lista no quadro.";

  return (
    <AppLayout
      title={titulo}
      subtitle={quadro?.nome || "Quadro"}
      breadcrumbItems={[
        { label: "Início", href: "/home" },
        { label: "Quadros", href: "/quadros" },
        {
          label: quadro?.nome || "Quadro",
          href: `/quadros/${quadroId}`,
        },
        { label: titulo },
      ]}
      user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
    >
      <div className="mx-auto max-w-lg space-y-4">
        <Button
          type="button"
          variant="secondary"
          leftIcon={<ArrowLeft size={16} aria-hidden="true" />}
          onClick={voltarQuadro}
        >
          Voltar ao quadro
        </Button>
        <PageHeader title={titulo} description={descricao} />
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-xs)]">
          <ListaEditorSurface modo={modo} onCancel={voltarQuadro} onSaved={voltarQuadro} />
        </div>
      </div>
    </AppLayout>
  );
}
