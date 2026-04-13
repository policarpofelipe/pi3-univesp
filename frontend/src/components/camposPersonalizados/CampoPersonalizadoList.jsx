import Button from "../ui/Button";

function labelTipo(tipo) {
  const labels = {
    texto: "Texto",
    numero: "Número",
    data: "Data",
    data_hora: "Data e hora",
    booleano: "Booleano",
    selecao: "Seleção",
    usuario: "Usuário",
  };
  return labels[tipo] || tipo;
}

export default function CampoPersonalizadoList({
  campos = [],
  onEditar,
  onRemover,
}) {
  return (
    <div className="space-y-2">
      {campos.map((campo) => (
        <article
          key={campo.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--color-border)] p-3"
        >
          <div>
            <strong className="block text-[var(--font-size-sm)] text-[var(--color-text)]">
              {campo.nome}
            </strong>
            <span className="text-[var(--font-size-xs)] text-[var(--color-text-muted)]">
              Tipo: {labelTipo(campo.tipo)} |{" "}
              {campo.obrigatorio ? "Obrigatório" : "Opcional"} |{" "}
              {campo.ativo ? "Ativo" : "Inativo"}
            </span>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => onEditar?.(campo)}>
              Editar
            </Button>
            <Button variant="ghost" onClick={() => onRemover?.(campo)}>
              Remover
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
