export const clearNulls = <T>(
  target: Record<string, string | object | null>,
): T => {
  for (const key in target) {
    if (typeof target[key] === "object" && target[key] !== null) {
      clearNulls(target[key] as Record<string, string | object | null>);
    } else if (target[key] === null) {
      target[key] = "";
    }
  }
  return target as T;
};
