import type { QTableColumn } from "quasar";
import type { Cycle } from "../types";
import moment from "moment";

export const fileColumns: QTableColumn<Cycle>[] = [
  {
    label: "Nombre",
    field: "name",
    name: "name",
    align: "left",
  },
  {
    label: "Fecha de inicio",
    field: "dateOfInit",
    name: "dateOfInit",
    align: "left",
    format(val) {
      return moment(val).format("dddd, DD-MMMM-YYYY");
    },
  },
  {
    label: "Fecha de fin",
    field: "dateOfEnd",
    name: "dateOfEnd",
    align: "left",
    format(val) {
      return moment(val).format("dddd, DD-MMMM-YYYY");
    },
  },
  {
    label: "Dias",
    field: "days",
    name: "days",
    align: 'center'
  },
  {
    label: "Visitas por dia",
    field: "visitPerDay",
    name: "visitPerDay",
    align: 'center'
  },
  {
    label: "Horas por dia",
    field: "hourPerDay",
    name: "hourPerDay",
    align: 'center'
  },
  {
    label: "Region",
    field: "region",
    name: "region",
    align: "left",
  },
  {
    label: "Estado",
    field: "state",
    name: "state",
    align: "left",
  }
];
