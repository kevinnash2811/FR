import type { LatLng } from "leaflet"
import { useSelectedAccountStore } from "../store"
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { accountsApi } from "@/connections/axiosCRM";
import { useQuasar } from "quasar";

export const useAccount = () => {
  const selectedAccountStore = useSelectedAccountStore();
  const queryClient = useQueryClient();
  const $q = useQuasar();

  const { mutateAsync: updateLocation } = useMutation<
    unknown,
    unknown,
    { id: string; lat: number; lng: number }
  >({
    mutationFn: async (location) => {
      return accountsApi.patch(`accounts/${location.id}`, {
        jjwg_maps_lat_c: location.lat,
        jjwg_maps_lng_c: location.lng,
      });
    },
    onSuccess: () => {
      $q.notify({
        message: "Ubicación actualizada",
        color: "green",
        position: "top-left",
        timeout: 500,
      });
      selectedAccountStore.clearSelectedAccount();
      queryClient.invalidateQueries()
      // TODO: Revalidate all queries
    },
  });

  return {
    createLocationMarker: async (location: LatLng) => {
      const id = selectedAccountStore.getSelectedAccount?.id;

      if (id) {
        await updateLocation({
          id,
          lat: location.lat,
          lng: location.lng,
        });

        selectedAccountStore.clearSelectedAccount();
      } else {
        $q.notify({
          message: "No se ha seleccionado una cuenta",
          color: "red",
          position: "top-left",
          timeout: 500,
        });
      }
    },
    updateLocation
  }
}