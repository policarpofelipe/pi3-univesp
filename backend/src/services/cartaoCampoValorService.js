const CartaoRepository = require("../repositories/CartaoRepository");
const CampoPersonalizadoRepository = require("../repositories/CampoPersonalizadoRepository");
const CartaoCampoValorRepository = require("../repositories/CartaoCampoValorRepository");
const CartaoHistoricoService = require("./cartaoHistoricoService");

function toPositiveInt(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
}

function parseDateTime(value) {
  if (value === null || value === "") return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function normalizeByType(tipo, rawValue) {
  const base = {
    valorTexto: null,
    valorNumero: null,
    valorData: null,
    valorDataHora: null,
    valorBooleano: null,
    valorOpcaoId: null,
    valorUsuarioId: null,
    valorJson: null,
  };

  if (rawValue === null || rawValue === undefined || rawValue === "") {
    return { empty: true, payload: base, normalizedValue: null };
  }

  if (tipo === "texto") {
    return {
      empty: false,
      payload: { ...base, valorTexto: String(rawValue), valorJson: JSON.stringify(String(rawValue)) },
      normalizedValue: String(rawValue),
    };
  }

  if (tipo === "numero") {
    const num = Number(rawValue);
    if (Number.isNaN(num)) return { invalid: true };
    return {
      empty: false,
      payload: { ...base, valorNumero: num, valorJson: JSON.stringify(num) },
      normalizedValue: num,
    };
  }

  if (tipo === "data") {
    const parsed = String(rawValue);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(parsed)) return { invalid: true };
    return {
      empty: false,
      payload: { ...base, valorData: parsed, valorJson: JSON.stringify(parsed) },
      normalizedValue: parsed,
    };
  }

  if (tipo === "data_hora") {
    const parsed = parseDateTime(rawValue);
    if (!parsed) return { invalid: true };
    return {
      empty: false,
      payload: { ...base, valorDataHora: parsed, valorJson: JSON.stringify(parsed) },
      normalizedValue: parsed,
    };
  }

  if (tipo === "booleano") {
    const boolValue = Boolean(rawValue);
    return {
      empty: false,
      payload: { ...base, valorBooleano: boolValue ? 1 : 0, valorJson: JSON.stringify(boolValue) },
      normalizedValue: boolValue,
    };
  }

  if (tipo === "usuario") {
    const userId = toPositiveInt(rawValue);
    if (!userId) return { invalid: true };
    return {
      empty: false,
      payload: { ...base, valorUsuarioId: userId, valorJson: JSON.stringify(userId) },
      normalizedValue: userId,
    };
  }

  if (tipo === "selecao") {
    return {
      empty: false,
      payload: { ...base, valorTexto: String(rawValue), valorJson: JSON.stringify(String(rawValue)) },
      normalizedValue: String(rawValue),
    };
  }

  return {
    empty: false,
    payload: { ...base, valorJson: JSON.stringify(rawValue) },
    normalizedValue: rawValue,
  };
}

function extractValueFromRow(tipo, row) {
  if (!row) return null;
  if (tipo === "texto" || tipo === "selecao") return row.valorTexto;
  if (tipo === "numero") return row.valorNumero != null ? Number(row.valorNumero) : null;
  if (tipo === "data") return row.valorData;
  if (tipo === "data_hora") return row.valorDataHora;
  if (tipo === "booleano") return row.valorBooleano == null ? null : Boolean(row.valorBooleano);
  if (tipo === "usuario") return row.valorUsuarioId;
  if (row.valorJson == null) return null;
  try {
    return JSON.parse(row.valorJson);
  } catch {
    return row.valorJson;
  }
}

class CartaoCampoValorService {
  async listar(quadroId, cartaoId) {
    const qId = toPositiveInt(quadroId);
    const cId = toPositiveInt(cartaoId);
    if (!qId || !cId) {
      throw Object.assign(new Error("IDs inválidos."), { statusCode: 400 });
    }

    const cartao = await CartaoRepository.obterPorId(qId, cId);
    if (!cartao) return null;

    const campos = await CampoPersonalizadoRepository.listar(qId);
    const valores = await CartaoCampoValorRepository.listarPorCartao(cId);
    const byCampoId = new Map(valores.map((item) => [Number(item.campoId), item]));

    return campos.map((campo) => {
      const row = byCampoId.get(Number(campo.id));
      return {
        campoId: campo.id,
        valor: extractValueFromRow(campo.tipo, row),
        atualizadoEm: row?.atualizadoEm || null,
      };
    });
  }

  async definir(quadroId, cartaoId, campoId, payload = {}, usuarioId = null) {
    const qId = toPositiveInt(quadroId);
    const cId = toPositiveInt(cartaoId);
    const cpId = toPositiveInt(campoId);
    if (!qId || !cId || !cpId) {
      throw Object.assign(new Error("IDs inválidos."), { statusCode: 400 });
    }

    const cartao = await CartaoRepository.obterPorId(qId, cId);
    if (!cartao) return null;

    const campo = await CampoPersonalizadoRepository.obterPorId(qId, cpId);
    if (!campo) {
      throw Object.assign(new Error("Campo personalizado não encontrado."), {
        statusCode: 404,
      });
    }

    const normalized = normalizeByType(campo.tipo, payload.valor);
    if (normalized.invalid) {
      throw Object.assign(
        new Error(`Valor inválido para o tipo de campo "${campo.tipo}".`),
        { statusCode: 400 }
      );
    }
    if (campo.obrigatorio && normalized.empty) {
      throw Object.assign(new Error("Este campo é obrigatório."), { statusCode: 400 });
    }

    if (normalized.empty) {
      await CartaoCampoValorRepository.remover(cId, cpId);
    } else {
      await CartaoCampoValorRepository.upsert(cId, cpId, {
        ...normalized.payload,
        atualizadoPorUsuarioId: usuarioId,
      });
    }

    await CartaoHistoricoService.registrar({
      cartaoId: cId,
      usuarioId: usuarioId || null,
      tipoEvento: "CAMPO_ALTERADO",
      dados: { campoId: cpId, campoNome: campo.nome, valor: normalized.normalizedValue },
    });

    const lista = await this.listar(qId, cId);
    return lista.find((item) => Number(item.campoId) === cpId) || { campoId: cpId, valor: null };
  }
}

module.exports = new CartaoCampoValorService();
