import { useAdvancedFilterStore } from "@/modules/Accounts/store/useAdvancedFilterStore";
import { clearNulls, iconsUrl } from "@/modules/Accounts/utils";
import { useMapStore } from "@/store";
import type { Account } from "@/types";
import {
  accountMarkersAdapter,
  accountResponseAdapter,
  createButton,
} from "@accounts/helpers";
import {
  getAccountMarkers,
  getAccounts,
  getTotalAccounts,
} from "@accounts/services";
import { Geolocation, type AdvancedFilter } from "@accounts/types";
import { useQuery } from "@tanstack/vue-query";
import leaflet, { Marker } from "leaflet";
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
  onClickMarker?: (args: {
    account: Omit<Account, "icon" | "color" | "zone" | "createdAt" | "zoneId" | "tasks">;
    marker: Marker;
  }) => void;
};

export const useAccounts = ({
  page,
  rowsPerPage,
  withLocation,
  filter,
  easyFilter,
  onClickMarker,
}: Args) => {
  const advancedFilterStore = useAdvancedFilterStore();
  const mapStore = useMapStore();

  const {
    isLoading: isLoadingMarkers,
    isFetching: isFetchingMarkers,
    refetch: refetchAccountMarkers,
  } = useQuery({
    queryKey: [
      "accountMarkers",
      {
        filter,
      },
    ],
    queryFn: async () => {
      const result = await Promise.all(
        advancedFilterStore.filter.assigned_to.length > 0
          ? advancedFilterStore.filter.assigned_to.map((id) =>
              getAccountMarkers(id),
            )
          : [getAccountMarkers()],
      );
      const data = result.flatMap((r) => r.data);

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
        createButton({
          container: buttonContainer,
          label: "Ver detalle",
          icon: "visibility",
          onClick: () => {
            onClickMarker?.({
              account,
              marker,
            });
          },
        });

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
    refetchOnWindowFocus: false,
  });

  const {
    data: accounts,
    isLoading: isLoadingAccounts,
    refetch: refetchAccounts,
    isFetching: isFetchingAccounts,
    failureReason,
  } = useQuery({
    queryKey: [
      "accounts",
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
        refetchAccounts();
      };
      const { data } = await getAccounts({
        signal,
        page: page.value,
        rowsPerPage: rowsPerPage.value.value,
        withLocation: withLocation.value,
        easyFilter: easyFilter.value,
        filter: clearNulls(advancedFilterStore.filter),
      });
      const response = accountResponseAdapter(data);

      return response;
    },
    initialData: [],
    refetchOnWindowFocus: false,
  });

  const {
    data: totalAccounts,
    refetch: refetchTotalAccounts,
    isLoading: isLoadingTotalAccounts,
    isFetching: isFetchingTotalAccounts,
  } = useQuery({
    queryKey: [
      "totalAccounts",
      {
        page,
        withLocation,
        rowsPerPage,
        filter,
        easyFilter,
      },
    ],
    queryFn: async () => {
      const { data } = await getTotalAccounts({
        withLocation: withLocation.value,
        easyFilter: easyFilter.value,
        filter: clearNulls(advancedFilterStore.filter),
      });
      return data;
    },
    initialData: 0,
    refetchOnWindowFocus: false,
  });

  const isLoading = computed(
    () =>
      isLoadingAccounts.value ||
      isLoadingTotalAccounts.value
  );

  const isFetching = computed(
    () =>
      isFetchingAccounts.value ||
      isFetchingTotalAccounts.value
  );

  const showPager = computed(() => 
    !isLoadingAccounts.value &&
    !isFetchingAccounts.value &&
    !isLoadingTotalAccounts.value &&
    !isFetchingTotalAccounts.value
  )

  const refetch = () => {
    refetchAccounts();
    refetchTotalAccounts();
    refetchAccountMarkers();
  };

  return {
    accounts,
    totalAccounts,
    isLoading,
    refetch,
    isFetching,
    isFetchingAccounts,
    isFetchingTotalAccounts,
    isLoadingTotalAccounts,
    failureReason,
    refetchTotalAccounts,
    showPager,
  };
};
