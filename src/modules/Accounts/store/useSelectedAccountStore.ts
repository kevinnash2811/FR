import type { Account } from "@/types";
import type { Icon, LatLng, Marker } from "leaflet";
import { defineStore } from "pinia";
import leaflet from "leaflet";
import { iconsUrl } from "../utils";
import marcadorRojo from "@/assets/Marcador-rojo.gif";
export const useSelectedAccountStore = defineStore("selectedAccount", {
  state(): {
    selectedAccount?: Omit<
      Account,
      "icon" | "color" | "zone" | "zoneId" | "createdAt"
    >;
    marker?: Marker;
  } {
    return {};
  },
  actions: {
    setSelectedAccount(
      account: Omit<
        Account,
        "icon" | "color" | "zone" | "zoneId" | "createdAt"
      >,
      marker?: Marker,
    ) {
      if (this.selectedAccount) {
        this.clearSelectedAccount();
      }

      this.selectedAccount = account;
      if (marker) {
        marker.setIcon(
          leaflet.icon({
            iconUrl: marcadorRojo,
            iconSize: [60, 65],
          }),
        );
        this.marker = marker;
      }
    },
    clearSelectedAccount() {
      this.marker?.setIcon(this._locationIcon());
      this.selectedAccount = undefined;
    },
    _locationIcon(): Icon {
      return leaflet.icon({
        iconUrl: iconsUrl["C"],
        iconSize: [30, 35],
      });
    },
    setLocation(location: LatLng) {
      if (this.selectedAccount?.location) {
        this.selectedAccount.location = location;
      }
    },
  },
  getters: {
    getSelectedAccount(state) {
      return state.selectedAccount;
    },
    getMarker(state) {
      return state.marker;
    },
    hasLocation(state) {
      return state.selectedAccount?.location !== undefined;
    },
  },
});
