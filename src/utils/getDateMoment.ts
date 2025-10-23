import moment from "moment";

export const getDateMoment = () => {
  const unaSemana = {
    from: moment().subtract(7, "days").format("DD-MM-YYYY"),
    to: moment().format("DD-MM-YYYY"),
  };
  const ultimos30dias = {
    from: moment().subtract(30, "days").format("DD-MM-YYYY"),
    to: moment().format("DD-MM-YYYY"),
  };
  const esteMes = {
    from: moment().startOf("month").format("DD-MM-YYYY"),
    to: moment().endOf("month").format("DD-MM-YYYY"),
  };
  const mesPasado = {
    from: moment().subtract(1, "month").startOf("month").format("DD-MM-YYYY"),
    to: moment().subtract(1, "month").endOf("month").format("DD-MM-YYYY"),
  };
  const primerTrimestre = {
    from: moment().month("January").startOf("month").format("DD-MM-YYYY"),
    to: moment().month("March").endOf("month").format("DD-MM-YYYY"),
  };
  const segundoTrimestre = {
    from: moment().month("April").startOf("month").format("DD-MM-YYYY"),
    to: moment().month("June").endOf("month").format("DD-MM-YYYY"),
  };
  const tercerTrimestre = {
    from: moment().month("July").startOf("month").format("DD-MM-YYYY"),
    to: moment().month("September").endOf("month").format("DD-MM-YYYY"),
  };
  const cuartoTrimestre = {
    from: moment().month("Octuber").startOf("month").format("DD-MM-YYYY"),
    to: moment().month("December").endOf("month").format("DD-MM-YYYY"),
  };
  const gestionPresente = {
    from: moment().startOf("year").format("DD-MM-YYYY"),
    to: moment().endOf("year").format("DD-MM-YYYY"),
  };
  const gestionPasada = {
    from: moment().subtract(1, "year").startOf("year").format("DD-MM-YYYY"),
    to: moment().subtract(1, "year").endOf("year").format("DD-MM-YYYY"),
  };

  const date = moment().startOf("month").format("DD-MM-YYYY");
  const today = moment().format("DD-MM-YYYY");
  return {
    date,
    unaSemana,
    esteMes,
    mesPasado,
    primerTrimestre,
    segundoTrimestre,
    tercerTrimestre,
    cuartoTrimestre,
    gestionPasada,
    gestionPresente,
    ultimos30dias,
    today,
  };
};
