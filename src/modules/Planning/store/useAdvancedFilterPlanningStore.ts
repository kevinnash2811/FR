import { useUserStore } from "@/store";
import moment from "moment";
import { defineStore } from "pinia";

export const useAdvancedFilterPlanningStore = defineStore('advancedFilterPlanning', {
  state: () => {
    const userStore = useUserStore();
    return {
      filter: {
        nombre: "",
        estado: "",
        creadoPor: "",
        tipo: "",
        division: "",
        sector: "",
        regional: "",
        date: {
          from: moment().format("DD/MMMM/YYYY"),
          to: moment().format("DD/MMMM/YYYY"),
        },
        creado_por: userStore.user?.reports_id ?? [],
      }
    }
  },
  actions: {
    clearFilter() {
      const userStore = useUserStore();
      Object.assign(this.filter, {
        nombre: "",
        estado: "",
        creadoPor: "",
        tipo: "",
        division: "",
        sector: "",
        regional: "",
        date: {
          from: moment().format("DD/MMMM/YYYY"),
          to: moment().format("DD/MMMM/YYYY"),
        },
        creado_por: userStore.user?.reports_id ?? [],
      });
    }
  }
});