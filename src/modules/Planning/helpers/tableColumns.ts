import type { QTableColumn } from "quasar";
import type {
  PrimitiveRouteDelivery,
  PrimitiveRouteVisit,
  PrimitiveVisit,
} from "@/modules/Planning/types";

export const deliveryRouteColumns: QTableColumn<PrimitiveRouteDelivery>[] = [
  {
    name: "named",
    align: "left",
    label: "Nombre",
    field: "named",
  },
  {
    name: "hourOfEnd",
    label: "Hora fin",
    align: "center",
    field: "hourOfEnd",
  },
  {
    name: "dateOfInit",
    align: "left",
    label: "Fecha de inicio",
    field: "dateOfInit",
  },
  // {
  //   name: "point",
  //   label: "Punto de partida",
  //   align: "center",
  //   field: "point",
  // },
  {
    name: "assignVehiclePlate",
    label: "Vehiculo",
    field: "assignVehicle",
    align: "center",
  },
  {
    name: "assignVehicleDriver",
    label: "Conductor",
    field: "assignVehicle",
    align: "left",
  },
  {
    name: "assignVehicleCapacity",
    label: "Capacidad",
    field: "assignVehicle",
    align: "center",
  },
  {
    name: "hourOfInit",
    label: "Hora inicio",
    align: "center",
    field: "hourOfInit",
  },
  {
    name: "duration",
    label: "Duración",
    align: "center",
    field: "duration",
  },
];
export const visitRouteColumns: QTableColumn<PrimitiveRouteVisit>[] = [
  {
    name: "named",
    align: "left",
    label: "Nombre de la ruta",
    field: "named",
  },
  {
    name: "hourOfEnd",
    label: "Hora fin",
    align: "center",
    field: "hourOfEnd",
  },
  {
    name: "dateOfInit",
    align: "left",
    label: "Fecha de inicio",
    field: "dateOfInit",
  },
  {
    name: "hourOfInit",
    label: "Hora inicio",
    align: "center",
    field: "hourOfInit",
  },
  {
    name: "duration",
    label: "Duración por visita",
    align: "center",
    field: "duration",
  },
];

export const visitColumns: QTableColumn<PrimitiveVisit>[] = [
  {
    name: "customer",
    label: "Datos del cliente",
    align: "left",
    field: "customer",
    style: "max-width: 170px",
  },
  {
    name: "activities",
    label: "Tareas Regla",
    align: "center",
    field: "customer",
  },
  {
    name: "activitiesCabecera",
    label: "Tareas Cabecera",
    align: "center",
    field: "customer",
  },
  {
    name: "hourOfInit",
    label: "Hora inicio",
    align: "center",
    field: "hourOfInit",
  },
  {
    name: "duration",
    label: "Duración",
    align: "center",
    field: "duration",
  },
  {
    name: "hourOfEnd",
    label: "Hora fin",
    align: "center",
    field: "hourOfEnd",
  },
];
