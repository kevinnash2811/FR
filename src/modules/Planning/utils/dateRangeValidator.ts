import moment from "moment";
export const dateRangeValidator = (
  date: string,
  dateCompare: {
    date: {
          from: string;
          to: string;
        } | string;
  },
) => {
  if (typeof dateCompare.date === "string") {
    return (
      date >=
        moment(dateCompare.date, "dddd, DD/MMMM/YYYY").format("YYYY/MM/DD") &&
      date <=
        moment(dateCompare.date, "dddd, DD/MMMM/YYYY").format("YYYY/MM/DD")
    );
  }

  return (
    date >=
      moment(dateCompare.date.from, "dddd, DD/MMMM/YYYY").format(
        "YYYY/MM/DD",
      ) &&
    date <=
      moment(dateCompare.date.to, "dddd, DD/MMMM/YYYY").format("YYYY/MM/DD")
  );
};
