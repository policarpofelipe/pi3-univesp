/**
 * Normaliza respostas { success, data } ou payloads já “desembrulhados”.
 */

export function extractList(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (response?.data != null && Array.isArray(response.data)) {
    return response.data;
  }

  return [];
}

export function extractObject(response) {
  if (response == null) {
    return null;
  }

  if (
    response.data != null &&
    typeof response.data === "object" &&
    !Array.isArray(response.data)
  ) {
    return response.data;
  }

  if (
    typeof response === "object" &&
    !Array.isArray(response) &&
    response.success === undefined
  ) {
    return response;
  }

  return response?.data ?? null;
}
