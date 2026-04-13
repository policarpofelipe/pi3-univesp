import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import CartaoCard from "../../cartoes/CartaoCard";
import { cardSortableId, parseCardSortableId } from "../../../utils/boardItemIds";

export default function BoardSortableCard({
  cartao,
  dragDisabled = false,
  children,
  ...cartaoCardProps
}) {
  const id = cardSortableId(cartao.id);
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: dragDisabled,
    data: { cartaoId: cartao.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        "board-sortable-card",
        isDragging ? "board-sortable-card--dragging" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      {...attributes}
    >
      <CartaoCard
        {...cartaoCardProps}
        cartao={cartao}
        dragActivatorRef={setActivatorNodeRef}
        dragListeners={dragDisabled ? undefined : listeners}
        isDragging={isDragging}
        dragDisabled={dragDisabled}
      />
      {children}
    </div>
  );
}

export { parseCardSortableId };
