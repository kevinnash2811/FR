import { useUserStore } from "@/store";
import { defineStore } from "pinia";

export const useAdvancedFilterVehicleStore = defineStore(
  "advancedFilterVehicleStore",
  {
    state() {
      const userStore = useUserStore();
      return {
        filter: {
          regional: userStore.user?.idregional,
          easyFilter: "",
          state: "",
          assigned_to: [],
        },
      };
    },
    actions: {},
  },
);
