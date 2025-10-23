import { useMapStore } from "@/store";
import {
  accountMarkersAdapter,
  deliveryResponseAdapter,
} from "@accounts/helpers";
import {
  getDeliveries,
  getDeliveriesMarkers,
  getTotalDeliveries,
} from "@accounts/services";
import { Geolocation, type AdvancedFilter } from "@accounts/types";
import { clearNulls, iconsUrl } from "@accounts/utils";
import { useQuery } from "@tanstack/vue-query";
import leaflet from "leaflet";
import { computed, type Ref } from "vue";

type Args = {
  page: Ref<number>;
  rowsPerPage: Ref<{
    label: string;
    value: number;
  }>;
  withLocation: Ref<Geolocation>;
  filter: AdvancedFilter;
  easyFilter: Ref<string>;
};

export const useDeliveries = ({
  page,
  rowsPerPage,
  withLocation,
  filter,
  easyFilter,
}: Args) => {
  const mapStore = useMapStore();

  const {
    isLoading: isLoadingMarkers,
    isFetching: isFetchingMarkers,
    refetch: refetchDeliveryMarkers,
  } = useQuery({
    queryKey: [
      "deliveryMarkers",
      {
        filter,
      },
    ],
    queryFn: async () => {
      const { data } = await getDeliveriesMarkers("");
      const accounts = accountMarkersAdapter(data);
      const cluster = mapStore.setCluster(
        leaflet.markerClusterGroup({
          // maxClusterRadius: 50,
          disableClusteringAtZoom: mapStore.map.getMaxZoom(),
          spiderfyOnMaxZoom: false,
          showCoverageOnHover: false,
        }),
      );

      const markers = accounts.map((account) => {
        const iconUrl = iconsUrl["C"];
        const myIcon = leaflet.icon({
          iconUrl,
          iconSize: [30, 35],
        });

        const marker = leaflet.marker(account.location!, {
          icon: myIcon,
        });
        marker.options.title = account.id;

        const content = leaflet.DomUtil.create("div");
        content.style.display = "flex";
        content.style.flexDirection = "column";
        content.style.gap = "10px";

        const detailAccount = leaflet.DomUtil.create("div", "", content);
        const buttonContainer = leaflet.DomUtil.create("div", "", content);
        detailAccount.style.display = "flex";
        detailAccount.style.flexDirection = "column";
        detailAccount.style.gap = "5px";

        const name = leaflet.DomUtil.create("span", "", detailAccount);
        name.textContent = account.name;

        const address = leaflet.DomUtil.create("span", "", detailAccount);
        address.textContent = account.address;
        // createButton({
        //   container: buttonContainer,
        //   label: 'Ver detalle',
        //   icon: 'visibility',
        //   onClick: () => {
        //     mapStore.map.setView(account.location!, mapStore.map.getMaxZoom());
        //     selectedAccountStore.setSelectedAccount(account, marker);
        //     dialogStore.toggle('detail', true);
        //   }
        // });

        buttonContainer.style.display = "flex";
        buttonContainer.style.gap = "5px";
        buttonContainer.style.flexDirection = "row";
        buttonContainer.style.justifyContent = "space-between";

        const popUp = leaflet.popup({
          content,
        });
        marker.bindPopup(popUp);

        marker.on("click", () => {
          mapStore.map.setView(account.location!, mapStore.map.getMaxZoom());
          marker.openPopup();
        });

        return marker;
      });

      cluster.addLayers(markers);
      mapStore.map.addLayer(cluster);
      return accounts;
    },
    initialData: [],
  });

  const {
    data: deliveries,
    isLoading: isLoadingDeliveries,
    refetch: refetchDeliveries,
    isFetching: isFetchingDeliveries,
    failureReason,
  } = useQuery({
    queryKey: [
      "deliveries",
      {
        page,
        withLocation,
        rowsPerPage,
        filter,
        easyFilter,
      },
    ],
    queryFn: async ({ signal }) => {
      signal.onabort = () => {
        refetchDeliveries();
      };
      const { data } = await getDeliveries({
        signal,
        page: page.value,
        rowsPerPage: rowsPerPage.value.value,
        withLocation: withLocation.value,
        easyFilter: easyFilter.value,
        filter: clearNulls(filter),
      });
      const response = deliveryResponseAdapter(data);

      return response;
    },
    initialData: [],
  });

  const {
    data: totalDeliveries,
    refetch: refetchTotalDeliveries,
    isLoading: isLoadingTotalDeliveries,
    isFetching: isFetchingTotalDeliveries,
  } = useQuery({
    queryKey: [
      "totalDeliveries",
      {
        page,
        withLocation,
        rowsPerPage,
        filter,
        easyFilter,
      },
    ],
    queryFn: async () => {
      const { data } = await getTotalDeliveries({
        withLocation: withLocation.value,
        easyFilter: easyFilter.value,
        filter,
      });
      return data;
    },
    initialData: 0,
    refetchOnWindowFocus: false,
  });

  const isLoading = computed(
    () =>
      isLoadingDeliveries.value ||
      isLoadingTotalDeliveries.value ||
      isLoadingMarkers.value,
  );
  const isFetching = computed(
    () =>
      isFetchingDeliveries.value ||
      isFetchingTotalDeliveries.value ||
      isFetchingMarkers.value,
  );

  const showPager = computed(
    () =>
      !isLoadingDeliveries.value &&
      !isFetchingDeliveries.value &&
      !isLoadingTotalDeliveries.value &&
      !isFetchingTotalDeliveries.value,
  );

  const refetch = () => {
    refetchDeliveries();
    refetchTotalDeliveries();
    refetchDeliveryMarkers();
  };

  return {
    deliveries,
    totalDeliveries,
    isLoading,
    refetch,
    isFetching,
    isFetchingDeliveries,
    isFetchingTotalDeliveries,
    isLoadingTotalDeliveries,
    failureReason,
    refetchTotalDeliveries,
    showPager,
  };
};
