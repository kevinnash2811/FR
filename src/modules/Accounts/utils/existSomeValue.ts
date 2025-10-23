export const existSomeValue = (obj: Record<string, any>): boolean => {
  return Object.values(obj).some((value) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    if (typeof value === "object" && value !== null) {
      return Object.values(value).some((v) => {
        return v !== "" && (typeof v !== "boolean" || v === true);
      });
    }

    if (typeof value === "boolean") {
      return value === true || value === false;
    }

    return value !== "";
  });
}