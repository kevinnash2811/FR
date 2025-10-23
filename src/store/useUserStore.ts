import { defineStore } from "pinia";
import type { User } from "@/types";
import { useStorage } from "@vueuse/core";
import { RolHBM, rolHBMMap } from "@/modules/Accounts/utils";

type State = {
  user?: User["userCRM"];
  accessToken?: User["token"];
  regionalLocation?: {
    lat: number;
    lng: number;
  };
};

export const useUserStore = defineStore("userStore", {
  state() {
    return useStorage<State>(
      "user",
      {
        accessToken: "",
        user: {
          id: "",
          nombres: "",
          apellidos: "",
          iddivision: "",
          division: "",
          idamercado: "",
          amercado: "",
          idregional: "",
          regional: "",
          rol: null,
          estado: "",
          activo: "",
          codigo_empleado: "",
          codigo_vendedor: "",
          email: "",
          id_reponsable: null,
          nombres_responsable: null,
          apellidos_responsable: null,
          pais: "",
          idgrupocliente: "",
          idlocation: "",
          rol_hbm_c: "",
          rol_hbm_label: "",
          namelocation: null,
          is_admin: false,
          idempresa: "",
          almacen_id: null,
          almacen_name: null,
          reports_id: [],
          reports_to_id: [],
          zona_ventas_c: [],
        },
      },
      sessionStorage,
    );
  },
  actions: {
    setUser({ token, userCRM }: User, location?: { lat: number; lng: number }) {
      this.user = userCRM;
      this.accessToken = token;
      this.regionalLocation = location;
    },
  },
  getters: {
    getFirstLetterOfName(): string {
      return (
        this.user?.nombres?.charAt(0) || this.user?.apellidos.charAt(0) || ""
      );
    },
    fullName(): string {
      return this.user?.nombres
        ? `${this.user?.nombres.concat(" ") ?? ""}${this.user?.apellidos}`
        : `${this.user?.apellidos}`;
    },
    rolHBM(): RolHBM {
      return rolHBMMap[this.user?.rol_hbm_c as keyof typeof RolHBM];
    },
    rolHBMLabel(): string {
      return this.user?.rol_hbm_c ?? "Sin asignar";
    },
    canViewModuleContactVisit(): boolean {
      return Number(this.user?.id) === 1;
    },
    canViewModuleCycle(): boolean {
      return this.isSupervisor
    },
    canViewModuleDelivery(): boolean {
      return (
        this.rolHBM === RolHBM.TRANSC ||
        this.rolHBM === RolHBM.ADM ||
        this.rolHBM === RolHBM.SSFFVV
      );
    },
    canViewModuleVisit(): boolean {
      return (
        this.rolHBM === RolHBM.FFVV ||
        this.rolHBM === RolHBM.ADM ||
        this.rolHBM === RolHBM.FFVVC ||
        this.rolHBM === RolHBM.FFVVCP ||
        this.rolHBM === RolHBM.FFVVI ||
        this.rolHBM === RolHBM.FFVVSS ||
        this.rolHBM === RolHBM.FFVVISR ||
        this.rolHBM === RolHBM.FFVVSM ||
        this.rolHBM === RolHBM.SSFFVVC ||
        this.rolHBM === RolHBM.SSFFVVI
      );
    },
    isSupervisor(): boolean {
      return (
        this.rolHBM === RolHBM.SSFFVV ||
        this.rolHBM === RolHBM.SSFFVVI ||
        this.rolHBM === RolHBM.SSFFVVC ||
        this.rolHBM === RolHBM.ADM
      );
    },
    isAdmin(): boolean {
      return this.rolHBM === RolHBM.ADM;
    },
    likeSelectableSupervisor(): { value: string; label: string } {
      return {
        value: this.user?.id ?? "",
        label: this.fullName,
      }
    }
  },
});
