/**
 * Normaliza filtro de visão (objeto ou string JSON) para objeto ou null.
 * @returns {{ ok: true, value: object|null } | { ok: false, error: string }}
 */
function parseFiltroJson(input) {
  if (input === undefined) {
    return { ok: true, value: undefined };
  }
  if (input === null || input === "") {
    return { ok: true, value: null };
  }

  let parsed = input;
  if (typeof input === "string") {
    try {
      parsed = JSON.parse(input);
    } catch {
      return { ok: false, error: "filtroJson contém JSON inválido." };
    }
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { ok: false, error: "filtroJson deve ser um objeto JSON." };
  }

  return { ok: true, value: parsed };
}

module.exports = {
  parseFiltroJson,
};
