import type { Delivery, DeliveryResponse, Entrega } from "@/types";
import leaflet from "leaflet";

export const deliveryResponseAdapter = (
  deliveries: DeliveryResponse[],
): Delivery[] => {
  return deliveries.map((delivery) => {
    const location =
      delivery.latitud !== 0 && delivery.longitud !== 0
        ? leaflet.latLng(delivery.latitud, delivery.longitud)
        : undefined;
    const entregas = JSON.parse(delivery.json_entregas ?? "[]") as Entrega[];

    return {
      id: delivery.id,
      name:
        delivery.nombre &&
        delivery.nombre.replace(/\s/gi, "").trim().length >= 1
          ? delivery.nombre
          : "Sin nombre",
      address: delivery.address ? ` ${delivery.address}` : "Sin dirección",
      icon: delivery.icon,
      color: delivery.color,
      location,
      category: delivery.categoria_ventas_c,
      dispatchs: delivery.cantEntregas ?? 0,
      createdAt: delivery.fecha_creacion,
      zoneId: delivery.idzona_ventas_c ?? "",
      zone: delivery.zona_ventas_c
        ? `${delivery.zona_ventas_c}`
        : "Sin zona de distribución",
      hasLocation: delivery.latitud !== 0 && delivery.longitud !== 0,
      firstReference: entregas
        .flatMap((e) => {
          if (e.referencia_c && e.referencia_c !== "") {
            return e.referencia_c;
          }

          return [];
        })
        .join(", "),
      secondReference: entregas
        .flatMap((e) => {
          if (e.referencia2_c && e.referencia2_c !== "") {
            return e.referencia2_c;
          }

          return [];
        })
        .join(", "),
      quote:
        entregas
          .flatMap((e) =>
            e.nro_factura_c && e.nro_factura_c !== "" ? e.nro_factura_c : [],
          )
          .join(", ") ?? "Sin facturas",
      note:
        entregas
          .flatMap((e) =>
            e.entrega_name && e.entrega_name !== "" ? e.entrega_name : [],
          )
          .join(", ") ?? "Sin notas de remisión",
      entregas,
    };
  });
};
