/**
 * Atualiza listas, cartões e tags no QuadroDetalhePage (já escuta este evento).
 */
export function emitQuadroListasCartoesTagsAtualizados(quadroId) {
  if (quadroId == null || quadroId === "") return;
  window.dispatchEvent(
    new CustomEvent("quadro:cartoes-tags-atualizados", {
      detail: { quadroId: String(quadroId) },
    })
  );
}
