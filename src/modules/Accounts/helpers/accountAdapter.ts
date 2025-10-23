import type { Account, AccountMarkerResponse, AccountResponse } from "@/types";
import leaflet from "leaflet";

export const accountResponseAdapter = (
  accounts: AccountResponse[],
): Account[] => {
  return accounts.map((account) => {
    const location =
      account.latitud !== 0 && account.longitud !== 0
        ? leaflet.latLng(account.latitud, account.longitud)
        : undefined;

    return {
      id: account.id,
      customerRegion: account.customerRegion ?? "",
      name:
        account.comercial_name &&
        account.comercial_name.replace(/\s/gi, "").trim().length >= 1
          ? account.comercial_name
          : "Sin nombre",
      address: account.address ? ` ${account.address}` : "Sin dirección",
      icon: account.icon,
      color: account.color,
      location,
      category: account.categoria_ventas_c,
      secondCategory: account.categoria_ventas02_c,
      createdAt: account.fecha_creacion,
      zoneId: account.idzona_ventas_c ?? "",
      zone: account.zona_ventas_c
        ? `${account.zona_ventas_c}`
        : "Sin zona de ventas",
      hasLocation: account.latitud !== 0 && account.longitud !== 0,
      tasks:
        account.tareas?.map((task) => {
          return {
            id: task.tarea_id,
            name: task.tarea_name,
            description: task.tarea_descripcion,
            status: task.tarea_estado,
            statusLabel: task.tarea_estado_label,
            iddivision_c: task.tarea_division,
            division: task.tarea_division_label,
            idamercado_c: task.tarea_amercado_c,
            amercado: task.tarea_amercado_label,
            region_c: task.tarea_region_c,
            region: task.tarea_region_c_label,
            tipo_tarea_c: task.tarea_tipo_tarea_c,
            tarea_para: task.tarea_para_c,
            obligatorio_c: task.tarea_obligatorio_c,
            tipotarea: task.tarea_tipo_tarea_c_label,
            estado_c: task.tarea_estado,
            estadotarea: task.tarea_estado_label,
            tarea_para_c: task.tarea_para_c,
            fecha_inicio_regla: task.fecha_inicio_regla,
            fecha_fin_regla: task.fecha_fin_regla,
          };
        }) ?? [],
    };
  });
};

export const accountMarkersAdapter = (
  accounts: AccountMarkerResponse[],
): Omit<
  Account,
  "icon" | "color" | "zone" | "createdAt" | "zoneId" | "tasks"
>[] => {
  return accounts.map((account) => {
    const location =
      account.lat !== null && account.lng !== null
        ? leaflet.latLng(account.lat, account.lng)
        : undefined;
    return {
      id: account.id,
      name: account.comercial_name,
      address: account.address,
      location,
      category: account.category,
      hasLocation: account.lat !== null && account.lng !== null,
    };
  });
};
