import { useDialogStore, useMapStore } from "@/store";
import { iconsUrl } from "@accounts/utils";
import leaflet, { Marker } from "leaflet";
import { useSelectedAccountStore } from "../store";
import { useConfirmDialogStore } from "../store/useConfirmDialogStore";
import type { ClientDetailResponse } from "../types";
import { useAccount } from "./useAccount";

export const useLocationAccount = ({ info_account }: ClientDetailResponse) => {
  const { updateLocation } = useAccount();
  const storeMap = useMapStore();
  const dialogStore = useDialogStore();
  const confirmDialogStore = useConfirmDialogStore();
  const selectedAccountStore = useSelectedAccountStore();
  const onCreateLocation = () => {
    const startDrawListener = () => {
      dialogStore.close();
      storeMap.map.off(leaflet.Draw.Event.DRAWSTART, startDrawListener);
    };

    storeMap.map.on(leaflet.Draw.Event.DRAWSTART, startDrawListener);
    const id = selectedAccountStore.getSelectedAccount?.id;

    if (!id) {
      return;
    }

    leaflet.Edit.Marker.addInitHook(function () {
      /* @ts-ignore */
      this._marker.options.icon = new leaflet.Icon({
        iconUrl: iconsUrl["C"],
        iconSize: [30, 35],
        shadowSize: [41, 41],
      });
    });

    const button = document
      .getElementsByClassName("leaflet-draw-draw-marker")
      .item(0);

    button?.dispatchEvent(new Event("click"));
  };

  const onEditLocation = () => {
    storeMap.cluster?.eachLayer((layer) => {
      if (layer instanceof Marker && layer.options.title === info_account.id) {
        dialogStore.close();
        layer.bindPopup("Mueve la ubicación de la cuenta");
        layer.openPopup();
        layer.on("dragend", async (event) => {
          const marker = event.target;
          const position = marker.getLatLng();
          const id = marker.options.title;
          confirmDialogStore.setCallback(async (value) => {
            if (value) {
              await updateLocation(
                {
                  id,
                  lat: position.lat,
                  lng: position.lng,
                },
                {
                  onSuccess() {
                    selectedAccountStore.setLocation(
                      leaflet.latLng(position.lat, position.lng),
                    );
                  },
                },
              );
            } else {
              const location = selectedAccountStore.selectedAccount?.location;
              marker.setLatLng(
                leaflet.latLng(location?.lat || 0, location?.lng || 0),
              );
            }
          });
          confirmDialogStore.openDialog("¿Desea actualizar la ubicación?");

          layer.dragging?.disable();
        });
        layer.dragging?.enable();
      }
    });
  };

  const onDeleteLocation = async () => {
    const id = selectedAccountStore.getSelectedAccount?.id;
    const marker = selectedAccountStore.marker;
    if (!id) {
      return;
    }

    confirmDialogStore.openDialog("¿Desea eliminar la ubicación?");
    confirmDialogStore.setCallback(async (value) => {
      if (value) {
        selectedAccountStore.clearSelectedAccount();
        await updateLocation({
          id,
          lat: 0,
          lng: 0,
        });
        storeMap.cluster?.removeLayer(marker as Marker);
      }
    });
  };

  return {
    onCreateLocation,
    onEditLocation,
    onDeleteLocation,
  };
};
