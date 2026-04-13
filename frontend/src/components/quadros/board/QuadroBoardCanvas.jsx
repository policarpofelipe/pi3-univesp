/**
 * Canvas do quadro com @dnd-kit (pointer + teclado). Para virtualizar listas
 * longas no futuro, isole a lista de cartões em um viewport dedicado e avalie
 * `BOARD_VIRTUALIZE_THRESHOLD` em `utils/boardFilterUtils.js` junto de
 * @tanstack/react-virtual (atenção à interação com sensores de arraste).
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import ListaColumn from "../../listas/ListaColumn";
import CriacaoRapidaCartao from "../../cartoes/CriacaoRapidaCartao";
import BoardSortableCard from "./BoardSortableCard";
import CartaoCard from "../../cartoes/CartaoCard";
import cartaoService from "../../../services/cartaoService";
import { cardSortableId, parseColumnDroppableId } from "../../../utils/boardItemIds";

function buildItemIdsByList(listas, cartoes) {
  const map = {};
  for (const l of listas) {
    map[String(l.id)] = cartoes
      .filter((c) => String(c.listaId) === String(l.id))
      .sort((a, b) => (a.posicao ?? 0) - (b.posicao ?? 0))
      .map((c) => cardSortableId(c.id));
  }
  return map;
}

function findContainer(itemsMap, id) {
  const s = String(id);
  if (Object.prototype.hasOwnProperty.call(itemsMap, s)) return s;
  for (const k of Object.keys(itemsMap)) {
    if (itemsMap[k].includes(s)) return k;
  }
  const col = parseColumnDroppableId(s);
  return col != null ? String(col) : null;
}

function DroppableListaBody({ listaId, children }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${listaId}`,
    data: { type: "column", listaId },
  });
  return (
    <div
      ref={setNodeRef}
      className={[
        "lista-column__cards",
        "lista-column__droptarget",
        isOver ? "lista-column__droptarget--over" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

export default function QuadroBoardCanvas({
  quadroId,
  listas,
  cartoes,
  tags,
  membrosPorUsuarioId = new Map(),
  dragDisabled = false,
  onCartoesUpdated,
  onEditCartao,
  onArquivarCartao,
  onMoverCartaoLista,
  movendoCartaoId,
  onCriacaoRapida,
  renderNovaListaColumn,
  listaColumnMenuPropsByIndex,
}) {
  const [itemIdsByList, setItemIdsByList] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const snapshotRef = useRef(null);
  const itemIdsRef = useRef({});

  useEffect(() => {
    itemIdsRef.current = itemIdsByList;
  }, [itemIdsByList]);

  const cartaoPorId = useMemo(() => {
    const m = new Map();
    for (const c of cartoes) {
      m.set(Number(c.id), c);
    }
    return m;
  }, [cartoes]);

  useEffect(() => {
    if (isDragging) return;
    setItemIdsByList(buildItemIdsByList(listas, cartoes));
  }, [listas, cartoes, isDragging]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: dragDisabled ? { distance: 9999 } : { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const activeCartao = useMemo(() => {
    if (!activeId) return null;
    const m = String(activeId).match(/^card-(\d+)$/);
    if (!m) return null;
    return cartaoPorId.get(Number(m[1])) || null;
  }, [activeId, cartaoPorId]);

  const handleDragStart = useCallback(
    ({ active }) => {
      if (dragDisabled) return;
      snapshotRef.current = JSON.parse(
        JSON.stringify(itemIdsRef.current || {})
      );
      setActiveId(active.id);
      setIsDragging(true);
    },
    [dragDisabled]
  );

  const handleDragOver = useCallback(({ active, over }) => {
    const overId = over?.id;
    if (!overId || String(active.id) === String(overId)) return;

    setItemIdsByList((items) => {
      const activeContainer = findContainer(items, active.id);
      const overContainer = findContainer(items, overId);
      if (!activeContainer || !overContainer) return items;

      if (activeContainer === overContainer) {
        if (String(overId).startsWith("column-")) return items;
        const col = [...items[activeContainer]];
        const activeIndex = col.indexOf(String(active.id));
        const overIndex = col.indexOf(String(overId));
        if (activeIndex < 0 || overIndex < 0) return items;
        if (activeIndex === overIndex) return items;
        return {
          ...items,
          [activeContainer]: arrayMove(col, activeIndex, overIndex),
        };
      }

      const from = [...items[activeContainer]];
      const to = [...items[overContainer]];
      const pos = from.indexOf(String(active.id));
      if (pos < 0) return items;
      const [moved] = from.splice(pos, 1);
      const overIndex = to.indexOf(String(overId));
      const insertAt = overIndex >= 0 ? overIndex : to.length;
      to.splice(insertAt, 0, moved);
      return {
        ...items,
        [activeContainer]: from,
        [overContainer]: to,
      };
    });
  }, []);

  const handleDragCancel = useCallback(() => {
    if (snapshotRef.current) {
      setItemIdsByList(snapshotRef.current);
    }
    setActiveId(null);
    setIsDragging(false);
    snapshotRef.current = null;
  }, []);

  const handleDragEnd = useCallback(
    async ({ active, over }) => {
      setActiveId(null);
      setIsDragging(false);
      const snap = snapshotRef.current;
      snapshotRef.current = null;

      if (dragDisabled || !over) {
        return;
      }

      const activeSid = String(active.id);
      const m = activeSid.match(/^card-(\d+)$/);
      const cardId = m ? Number(m[1]) : null;
      if (!cardId) return;

      const final = itemIdsRef.current;
      const dest = findContainer(final, activeSid);
      if (!dest) return;

      const ord = final[dest] || [];
      const pos = ord.indexOf(activeSid);
      if (pos < 0) return;

      const listaDestinoId = Number(dest);

      if (snap) {
        const origC = findContainer(snap, activeSid);
        const origIdx =
          origC != null ? (snap[origC] || []).indexOf(activeSid) : -1;
        if (origC === dest && origIdx === pos) {
          return;
        }
      }

      try {
        await cartaoService.mover(quadroId, cardId, {
          listaId: listaDestinoId,
          posicao: pos,
        });
        await onCartoesUpdated?.();
      } catch (err) {
        if (snap) setItemIdsByList(snap);
        window.alert(
          err?.response?.data?.message ||
            err?.message ||
            "Não foi possível mover o cartão."
        );
      }
    },
    [dragDisabled, quadroId, onCartoesUpdated]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div
        className="quadro-detalhe-page__columns-scroller"
        role="region"
        aria-label="Listas em rolagem horizontal"
      >
        {listas.map((lista, index) => {
          const lid = String(lista.id);
          const ids = itemIdsByList[lid] || [];
          const contagemVisivel = ids.length;
          const menu = listaColumnMenuPropsByIndex?.[index];

          return (
            <ListaColumn
              key={lista.id}
              lista={{
                ...lista,
                totalCartoes: contagemVisivel,
              }}
              boardMenu={menu}
            >
              <CriacaoRapidaCartao
                listaId={lista.id}
                onCriar={onCriacaoRapida}
                variant="kanban"
              />
              <DroppableListaBody listaId={lista.id}>
                <SortableContext
                  id={lid}
                  items={ids}
                  strategy={verticalListSortingStrategy}
                >
                  {ids.map((sid) => {
                    const idNum = Number(String(sid).replace(/^card-/, ""));
                    const c = cartaoPorId.get(idNum);
                    if (!c) return null;
                    return (
                      <BoardSortableCard
                        key={sid}
                        cartao={c}
                        dragDisabled={dragDisabled}
                        quadroId={quadroId}
                        tagsDisponiveis={tags}
                        listas={listas}
                        membrosPorUsuarioId={membrosPorUsuarioId}
                        movendo={movendoCartaoId === c.id}
                        onEdit={onEditCartao}
                        onArquivar={onArquivarCartao}
                        onMoverLista={onMoverCartaoLista}
                      />
                    );
                  })}
                </SortableContext>
              </DroppableListaBody>
            </ListaColumn>
          );
        })}
        {renderNovaListaColumn?.()}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeCartao ? (
          <div className="board-drag-overlay">
            <CartaoCard
              quadroId={quadroId}
              cartao={activeCartao}
              tagsDisponiveis={tags}
              listas={listas}
              membrosPorUsuarioId={membrosPorUsuarioId}
              isDragging
              dragDisabled
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
