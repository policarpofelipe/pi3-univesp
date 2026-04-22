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
  if (s.startsWith("column-")) {
    const col = parseColumnDroppableId(s);
    return col != null ? String(col) : null;
  }

  if (Object.prototype.hasOwnProperty.call(itemsMap, s)) return s;
  for (const k of Object.keys(itemsMap)) {
    if (itemsMap[k].includes(s)) return k;
  }
  return null;
}

function DroppableListaBody({ listaId, children }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${listaId}`,
    data: { type: "column", listaId, isEmpty: true },
  });
  return (
    <div
      ref={setNodeRef}
      style={{ minHeight: "100px" }}
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
  const DEBUG_DND = true;
  const [itemIdsByList, setItemIdsByList] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const snapshotRef = useRef(null);
  const itemIdsRef = useRef({});
  const lastOverIdRef = useRef(null);

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
      if (DEBUG_DND) {
        console.debug("[DND] dragStart", {
          activeId: String(active?.id ?? ""),
          dragDisabled,
        });
      }
      snapshotRef.current = JSON.parse(
        JSON.stringify(itemIdsRef.current || {})
      );
      setActiveId(active.id);
      setIsDragging(true);
      lastOverIdRef.current = null;
    },
    [DEBUG_DND, dragDisabled]
  );

  const handleDragOver = useCallback(({ active, over }) => {
    const overId = over?.id;
    if (!overId) return;
    if (String(active.id) !== String(overId)) lastOverIdRef.current = String(overId);
    if (String(active.id) === String(overId)) return;

    setItemIdsByList((items) => {
      const activeContainer = findContainer(items, active.id);
      const overContainer = findContainer(items, overId);
      if (!activeContainer) return items;

      const targetContainer = overContainer
        || (String(overId).startsWith("column-")
          ? String(parseColumnDroppableId(String(overId)) || "")
          : null);
      if (DEBUG_DND) {
        console.debug("[DND] dragOver", {
          activeId: String(active?.id ?? ""),
          overId: String(overId),
          activeContainer,
          overContainer,
          targetContainer,
        });
      }
      if (!targetContainer) return items;

      const nextItems = { ...items };
      if (!Array.isArray(nextItems[targetContainer])) {
        nextItems[targetContainer] = [];
      }

      if (activeContainer === targetContainer) {
        if (String(overId).startsWith("column-")) return items;
        const col = [...nextItems[activeContainer]];
        const activeIndex = col.indexOf(String(active.id));
        const overIndex = col.indexOf(String(overId));
        if (activeIndex < 0 || overIndex < 0) return items;
        if (activeIndex === overIndex) return items;
        return {
          ...nextItems,
          [activeContainer]: arrayMove(col, activeIndex, overIndex),
        };
      }

      const from = [...(nextItems[activeContainer] || [])];
      const to = [...(nextItems[targetContainer] || [])];
      const pos = from.indexOf(String(active.id));
      if (pos < 0) return nextItems;
      const [moved] = from.splice(pos, 1);
      const overIndex = String(overId).startsWith("column-")
        ? -1
        : to.indexOf(String(overId));
      const insertAt = overIndex >= 0 ? overIndex : to.length;
      to.splice(insertAt, 0, moved);
      return {
        ...nextItems,
        [activeContainer]: from,
        [targetContainer]: to,
      };
    });
  }, [DEBUG_DND]);

  const handleDragCancel = useCallback(() => {
    if (snapshotRef.current) {
      setItemIdsByList(snapshotRef.current);
    }
    setActiveId(null);
    setIsDragging(false);
    snapshotRef.current = null;
    lastOverIdRef.current = null;
  }, []);

  const handleDragEnd = useCallback(
    async ({ active, over }) => {
      setActiveId(null);
      const snap = snapshotRef.current;
      const activeSid = String(active.id);
      const overIdEfetivo =
        over?.id && String(over.id) !== activeSid
          ? over.id
          : lastOverIdRef.current;

      if (dragDisabled || !overIdEfetivo) {
        if (DEBUG_DND) {
          console.debug("[DND] dragEnd aborted", {
            reason: "dragDisabled_or_no_over",
            dragDisabled,
            overIdEfetivo,
            lastOverId: lastOverIdRef.current,
          });
        }
        if (snap) {
          setItemIdsByList(snap);
        }
        setIsDragging(false);
        snapshotRef.current = null;
        lastOverIdRef.current = null;
        return;
      }

      const m = activeSid.match(/^card-(\d+)$/);
      const cardId = m ? Number(m[1]) : null;
      if (!cardId) {
        if (DEBUG_DND) {
          console.debug("[DND] dragEnd aborted", {
            reason: "invalid_card_id",
            activeSid,
          });
        }
        setIsDragging(false);
        snapshotRef.current = null;
        lastOverIdRef.current = null;
        return;
      }

      const overId = String(overIdEfetivo);
      const draft = JSON.parse(JSON.stringify(itemIdsRef.current || {}));
      const activeContainer = findContainer(draft, activeSid);
      const overContainerRaw = findContainer(draft, overId);
      const overContainer = overContainerRaw
        || (overId.startsWith("column-")
          ? String(parseColumnDroppableId(overId) || "")
          : null);
      if (DEBUG_DND) {
        console.debug("[DND] dragEnd containers", {
          activeSid,
          overId,
          overIdEfetivo: String(overIdEfetivo),
          activeContainer,
          overContainerRaw,
          overContainer,
        });
      }

      if (!activeContainer || !overContainer) {
        if (DEBUG_DND) {
          console.debug("[DND] dragEnd aborted", {
            reason: "container_not_found",
            activeContainer,
            overContainer,
          });
        }
        if (snap) {
          setItemIdsByList(snap);
        }
        setIsDragging(false);
        snapshotRef.current = null;
        lastOverIdRef.current = null;
        return;
      }

      if (!Array.isArray(draft[activeContainer])) {
        draft[activeContainer] = [];
      }
      if (!Array.isArray(draft[overContainer])) {
        draft[overContainer] = [];
      }

      if (activeContainer !== overContainer) {
        const from = [...(draft[activeContainer] || [])];
        const to = [...(draft[overContainer] || [])];
        const fromIdx = from.indexOf(activeSid);
        if (fromIdx >= 0) {
          from.splice(fromIdx, 1);
        }

        const overIndex = to.indexOf(overId);
        const insertAt = overIndex >= 0 ? overIndex : to.length;
        if (!to.includes(activeSid)) {
          to.splice(insertAt, 0, activeSid);
        }

        draft[activeContainer] = from;
        draft[overContainer] = to;
      } else if (String(overId).startsWith("column-")) {
        const same = [...(draft[activeContainer] || [])];
        if (!same.includes(activeSid)) {
          same.push(activeSid);
          draft[activeContainer] = same;
        }
      }

      setItemIdsByList(draft);

      const dest = overContainer;
      const ord = draft[dest] || [];
      const pos = ord.indexOf(activeSid);
      if (DEBUG_DND) {
        console.debug("[DND] dragEnd position", {
          dest,
          listaDestinoId: Number(dest),
          pos,
          ord,
        });
      }
      if (pos < 0) {
        if (snap) {
          setItemIdsByList(snap);
        }
        setIsDragging(false);
        snapshotRef.current = null;
        lastOverIdRef.current = null;
        return;
      }

      const listaDestinoId = Number(dest);
      if (!Number.isInteger(listaDestinoId) || listaDestinoId <= 0) {
        if (DEBUG_DND) {
          console.debug("[DND] dragEnd aborted", {
            reason: "invalid_dest_list_id",
            dest,
            listaDestinoId,
          });
        }
        if (snap) {
          setItemIdsByList(snap);
        }
        setIsDragging(false);
        snapshotRef.current = null;
        lastOverIdRef.current = null;
        return;
      }

      if (snap) {
        const origC = findContainer(snap, activeSid);
        const origIdx =
          origC != null ? (snap[origC] || []).indexOf(activeSid) : -1;
        if (origC === dest && origIdx === pos) {
          setIsDragging(false);
          snapshotRef.current = null;
          lastOverIdRef.current = null;
          return;
        }
      }

      try {
        if (DEBUG_DND) {
          console.debug("[DND] persist move request", {
            quadroId,
            cardId,
            listaId: listaDestinoId,
            posicao: pos,
          });
        }
        await cartaoService.mover(quadroId, cardId, {
          listaId: listaDestinoId,
          posicao: pos,
        });
        if (DEBUG_DND) {
          console.debug("[DND] persist move success", { cardId, listaDestinoId, pos });
        }
        await onCartoesUpdated?.();
      } catch (err) {
        if (DEBUG_DND) {
          console.error("[DND] persist move error", {
            cardId,
            listaDestinoId,
            pos,
            status: err?.response?.status,
            message: err?.response?.data?.message || err?.message,
            data: err?.response?.data,
          });
        }
        if (snap) setItemIdsByList(snap);
        window.alert(
          err?.response?.data?.message ||
            err?.message ||
            "Não foi possível mover o cartão."
        );
      } finally {
        setIsDragging(false);
        snapshotRef.current = null;
        lastOverIdRef.current = null;
      }
    },
    [DEBUG_DND, dragDisabled, quadroId, onCartoesUpdated]
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
