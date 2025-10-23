import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import { useMapStore } from "./useMapStore";

type State = {
  position: number;
  shadowSize: number;
};

export const useTabStore = defineStore("tabStore", {
  state() {
    return useStorage<State>(
      "tabStore",
      {
        position: 20,
        shadowSize: 20,
      },
      undefined,
      { mergeDefaults: true },
    );
  },
  actions: {
    setShadowPosition(size: number) {
      const mapStore = useMapStore();
      this.shadowSize = size;
      mapStore.map.invalidateSize();
    },
    close() {
      this.position = 0;
    },
    open() {
      this.position = this.shadowSize;
    },
    openFullScreen() {
      this.position = 100;
    },
    closeFullScreen() {
      this.position = this.shadowSize;
    },
  },
  getters: {
    isOpen(state) {
      return state.position !== 0;
    },
    isFullScreen(state) {
      return state.position === 100;
    },
  },
});
