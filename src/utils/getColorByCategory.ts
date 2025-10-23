export const getColorByCategory = (category?: string) => {
  return category === "A"
    ? "red-14"
    : category === "B"
      ? "yellow-14"
      : category === "C"
        ? "green-14"
        : category === "D"
          ? "blue-14"
          : category === "green-14"
          ? "green-14"
          : "grey-7";
}