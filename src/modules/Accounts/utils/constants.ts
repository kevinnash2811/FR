import { Geolocation, type Panel } from "@accounts/types";
import marcadorRojo from "@/assets/Marcador-rojo.png";
import marcadorAmarillo from "@/assets/Marcador-amarillo.png";
import marcadorVerde from "@/assets/Marcador-verde.png";
import marcadorAzul from "@/assets/Marcador-azul.png";
import marcadorGris from "@/assets/Marcador-gris.png";
import marcadorRojoGIF from "@/assets/Marcador-rojo.gif";
export const panels: Panel[] = [
  {
    label: "Todos",
    name: Geolocation.ALL,
  },
  {
    label: "Sin Geolocalización",
    name: Geolocation.WITHOUT_LOCATION,
  },
  {
    label: "Solo con Geolocalización",
    name: Geolocation.WITH_LOCATION,
  },
];

export const perPageOptions = [
  {
    label: "5",
    value: 5,
  },
  {
    label: "10",
    value: 10,
  },
  {
    label: "15",
    value: 15,
  },
  {
    label: "20",
    value: 20,
  },
  {
    label: "50",
    value: 50,
  },
];

export const iconsUrl = {
  A: marcadorRojo,
  B: marcadorAmarillo,
  C: marcadorVerde,
  D: marcadorAzul,
  default: marcadorGris,
  redGIF: marcadorRojoGIF,
};

export const iconColor = {
  A: "green-14",
  B: "green-14",
  C: "green-14",
  D: "green-14",
  default: "grey-7",
};

export const days = [
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado",
  "Domingo",
];

export enum RolHBM {
  "05020103",
  ADM,
  EECC,
  FFVV,
  FFVVC,
  FFVVCP,
  FFVVI,
  FFVVISR,
  FFVVSM,
  FFVVSS,
  SSFFVV,
  SSFFVVC,
  SSFFVVI,
  TRADC,
  TRADMC,
  TRANSC,
}

export const rolHBMMap: Record<keyof typeof RolHBM, RolHBM> = {
  "05020103": RolHBM["05020103"],
  ADM: RolHBM.ADM,
  EECC: RolHBM.EECC,
  FFVV: RolHBM.FFVV,
  FFVVC: RolHBM.FFVVC,
  FFVVCP: RolHBM.FFVVCP,
  FFVVI: RolHBM.FFVVI,
  FFVVISR: RolHBM.FFVVISR,
  FFVVSM: RolHBM.FFVVSM,
  FFVVSS: RolHBM.FFVVSS,
  SSFFVV: RolHBM.SSFFVV,
  SSFFVVC: RolHBM.SSFFVVC,
  SSFFVVI: RolHBM.SSFFVVI,
  TRADC: RolHBM.TRADC,
  TRADMC: RolHBM.TRADMC,
  TRANSC: RolHBM.TRANSC,
};
