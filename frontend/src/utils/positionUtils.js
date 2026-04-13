export function reorderByMove(items = [], fromIndex, toIndex) {
  const arr = [...items];
  if (
    fromIndex < 0 ||
    fromIndex >= arr.length ||
    toIndex < 0 ||
    toIndex >= arr.length
  ) {
    return arr;
  }
  const [item] = arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, item);
  return arr;
}

export function toIdOrder(items = []) {
  return items.map((item) => item.id);
}
