import { useUserStore } from "@/store";
import moment from "moment";
import { defineStore } from "pinia";
import { computed } from "vue";

export const useAdvancedFilterVisitsStore = defineStore(
  "advancedFilterVisits",
  {
    state: () => {
      const userStore = useUserStore();
      let dateInit = moment().format("YYYY-MM-DD");
      let dateEnd = moment().format("YYYY-MM-DD");
      return {
        filter: {
          fecha: computed({
            get: () => ({
              from: dateInit,
              to: dateEnd,
            }),
            set: (val) => {
              dateInit = val.from;
              dateEnd = val.to;
            },
          }),
          codUsuario: [userStore.user!.codigo_vendedor],
          regional: userStore.user?.idregional,
          areaMercado: userStore.user?.idamercado,
          division: userStore.user?.iddivision,
          easyFilter: "",
        },
      };
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
            from: moment().format("YYYY-MM-DD"),
            to: moment().format("YYYY-MM-DD"),
          },
          creado_por: userStore.user?.reports_id ?? [],
        });
      },
    },
  },
);
