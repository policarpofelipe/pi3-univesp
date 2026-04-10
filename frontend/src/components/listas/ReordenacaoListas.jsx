import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import Button from "../ui/Button";

/**
 * Botões para mover uma lista na ordem; o pai aplica a nova ordem (ex.: API reordenar).
 */
export default function ReordenacaoListas({
  index,
  total,
  onMoveUp,
  onMoveDown,
  disabled = false,
}) {
  const canUp = index > 0;
  const canDown = index < total - 1;

  return (
    <div className="inline-flex flex-col gap-0.5" role="group" aria-label="Reordenar lista">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="!px-1 !py-0 min-h-0"
        disabled={disabled || !canUp}
        onClick={onMoveUp}
        aria-label="Mover lista para cima"
      >
        <ChevronUp size={16} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="!px-1 !py-0 min-h-0"
        disabled={disabled || !canDown}
        onClick={onMoveDown}
        aria-label="Mover lista para baixo"
      >
        <ChevronDown size={16} />
      </Button>
    </div>
  );
}
