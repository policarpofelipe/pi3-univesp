export function hasAnyPermission(permissoes = {}, keys = []) {
  return keys.some((key) => Boolean(permissoes?.[key]));
}

export function hasAllPermissions(permissoes = {}, keys = []) {
  return keys.every((key) => Boolean(permissoes?.[key]));
}

export function can(permissoes = {}, key) {
  return Boolean(permissoes?.[key]);
}
