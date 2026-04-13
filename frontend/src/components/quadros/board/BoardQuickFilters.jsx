import React, { useId, useState } from "react";
import { Filter, X } from "lucide-react";

import Button from "../../ui/Button";
import {
  BOARD_FILTER_DEADLINE,
  BOARD_FILTER_PRIORITIES,
  BOARD_FILTER_SITUATION,
  filtrosEstaoAtivos,
} from "../../../utils/boardFilterUtils";

function ChipRemovivel({ label, onRemove }) {
  return (
    <span className="board-quick-filters__chip">
      <span className="board-quick-filters__chip-text">{label}</span>
      <button
        type="button"
        className="board-quick-filters__chip-remove"
        onClick={onRemove}
        aria-label={`Remover filtro ${label}`}
      >
        <X size={14} aria-hidden="true" />
      </button>
    </span>
  );
}

export default function BoardQuickFilters({
  filters,
  onChange,
  tags = [],
  membros = [],
}) {
  const baseId = useId();
  const [painelAberto, setPainelAberto] = useState(false);

  function patch(partial) {
    onChange?.({ ...filters, ...partial });
  }

  const ativos = filtrosEstaoAtivos(filters);

  const chips = [];
  if (String(filters.busca || "").trim()) {
    chips.push({
      key: "busca",
      label: `Busca: “${String(filters.busca).trim()}”`,
      onRemove: () => patch({ busca: "" }),
    });
  }
  if (filters.tagId) {
    const t = tags.find((x) => String(x.id) === String(filters.tagId));
    chips.push({
      key: "tag",
      label: `Tag: ${t?.nome || filters.tagId}`,
      onRemove: () => patch({ tagId: "" }),
    });
  }
  if (filters.prioridade) {
    const p = BOARD_FILTER_PRIORITIES.find(
      (x) => x.value === filters.prioridade
    );
    chips.push({
      key: "prio",
      label: `Prioridade: ${p?.label || filters.prioridade}`,
      onRemove: () => patch({ prioridade: "" }),
    });
  }
  if (filters.prazo) {
    const p = BOARD_FILTER_DEADLINE.find((x) => x.value === filters.prazo);
    chips.push({
      key: "prazo",
      label: `Prazo: ${p?.label || filters.prazo}`,
      onRemove: () => patch({ prazo: "" }),
    });
  }
  if (filters.situacao) {
    const p = BOARD_FILTER_SITUATION.find((x) => x.value === filters.situacao);
    chips.push({
      key: "sit",
      label: `Situação: ${p?.label || filters.situacao}`,
      onRemove: () => patch({ situacao: "" }),
    });
  }
  if (filters.membroId) {
    const m = membros.find(
      (x) => String(x.usuarioId ?? x.id) === String(filters.membroId)
    );
    chips.push({
      key: "membro",
      label: `Responsável: ${m?.nome || filters.membroId}`,
      onRemove: () => patch({ membroId: "" }),
    });
  }

  return (
    <section
      className="board-quick-filters"
      aria-label="Filtros rápidos do quadro"
    >
      <div className="board-quick-filters__row">
        <div className="board-quick-filters__search">
          <label className="sr-only" htmlFor={`${baseId}-busca`}>
            Buscar no título do cartão
          </label>
          <input
            id={`${baseId}-busca`}
            type="search"
            className="board-quick-filters__input"
            placeholder="Buscar cartões…"
            value={filters.busca || ""}
            onChange={(e) => patch({ busca: e.target.value })}
            autoComplete="off"
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          aria-expanded={painelAberto}
          aria-controls={`${baseId}-painel`}
          leftIcon={<Filter size={16} aria-hidden="true" />}
          onClick={() => setPainelAberto((v) => !v)}
        >
          Mais filtros
        </Button>
        {ativos ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              onChange?.({
                busca: "",
                tagId: "",
                prioridade: "",
                prazo: "",
                situacao: "",
                membroId: "",
              })
            }
          >
            Limpar filtros
          </Button>
        ) : null}
      </div>

      {painelAberto ? (
        <div
          id={`${baseId}-painel`}
          className="board-quick-filters__panel"
          role="region"
          aria-label="Opções de filtro adicionais"
        >
          <div className="board-quick-filters__grid">
            <div className="board-quick-filters__field">
              <label className="board-quick-filters__label" htmlFor={`${baseId}-tag`}>
                Tag
              </label>
              <select
                id={`${baseId}-tag`}
                className="board-quick-filters__select"
                value={filters.tagId || ""}
                onChange={(e) => patch({ tagId: e.target.value })}
              >
                <option value="">Todas</option>
                {tags.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="board-quick-filters__field">
              <label
                className="board-quick-filters__label"
                htmlFor={`${baseId}-prio`}
              >
                Prioridade
              </label>
              <select
                id={`${baseId}-prio`}
                className="board-quick-filters__select"
                value={filters.prioridade || ""}
                onChange={(e) => patch({ prioridade: e.target.value })}
              >
                {BOARD_FILTER_PRIORITIES.map((p) => (
                  <option key={p.value || "all"} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="board-quick-filters__field">
              <label
                className="board-quick-filters__label"
                htmlFor={`${baseId}-prazo`}
              >
                Prazo
              </label>
              <select
                id={`${baseId}-prazo`}
                className="board-quick-filters__select"
                value={filters.prazo || ""}
                onChange={(e) => patch({ prazo: e.target.value })}
              >
                {BOARD_FILTER_DEADLINE.map((p) => (
                  <option key={p.value || "all"} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="board-quick-filters__field">
              <label
                className="board-quick-filters__label"
                htmlFor={`${baseId}-sit`}
              >
                Situação
              </label>
              <select
                id={`${baseId}-sit`}
                className="board-quick-filters__select"
                value={filters.situacao || ""}
                onChange={(e) => patch({ situacao: e.target.value })}
              >
                {BOARD_FILTER_SITUATION.map((p) => (
                  <option key={p.value || "all"} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="board-quick-filters__field">
              <label
                className="board-quick-filters__label"
                htmlFor={`${baseId}-membro`}
              >
                Responsável
              </label>
              <select
                id={`${baseId}-membro`}
                className="board-quick-filters__select"
                value={filters.membroId || ""}
                onChange={(e) => patch({ membroId: e.target.value })}
              >
                <option value="">Qualquer</option>
                {membros.map((m) => {
                  const uid = m.usuarioId ?? m.usuario_id;
                  if (uid == null) return null;
                  return (
                    <option key={m.id} value={String(uid)}>
                      {m.nome}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>
      ) : null}

      {chips.length ? (
        <div className="board-quick-filters__chips" role="list">
          {chips.map((c) => (
            <span key={c.key} role="listitem">
              <ChipRemovivel label={c.label} onRemove={c.onRemove} />
            </span>
          ))}
        </div>
      ) : null}

      {ativos ? (
        <p className="board-quick-filters__hint" role="status">
          Filtros ativos: arrastar cartões está pausado para manter a ordem
          alinhada ao servidor. Limpe os filtros para reorganizar por arraste.
        </p>
      ) : null}
    </section>
  );
}
