import { useStorage } from "@vueuse/core";
import { defineStore } from "pinia";
import { Geolocation } from "@accounts/types";

type State = {
  easyFilter: string;
  tab: Geolocation;
};

export const useFilterStore = defineStore("filters", {
  state: () =>
    useStorage<State>("filters", {
      easyFilter: "",
      tab: Geolocation.ALL,
    }),
  actions: {
    setEasyFilter(easyFilter: string) {
      this.easyFilter = easyFilter;
    },
    setTab(geolocation: Geolocation) {
      this.tab = geolocation;
    },
  },
});
