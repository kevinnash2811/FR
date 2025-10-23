import { defineStore } from "pinia";
import type { PrimitiveRouteDelivery, PrimitiveRouteVisit } from "@/modules/Planning/types";

type State = {
  selectedRow?: PrimitiveRouteDelivery | PrimitiveRouteVisit;
  selectedIndex: number;
}

export const useSelectedRowStore = defineStore('selectedRowStore', {
  state(): State {
    return {
      selectedIndex: -1,
    };
  },
  actions: {
    setSelectedRow(row: PrimitiveRouteDelivery | PrimitiveRouteVisit, index: number) {
      this.selectedRow = row;
      this.selectedIndex = index;
    },
    clearSelectedRow() {
      this.selectedRow = undefined;
      this.selectedIndex = -1;
    },
  },
  getters: {
    isSelectedRow(state) {
      return state.selectedRow;
    },
  },
});