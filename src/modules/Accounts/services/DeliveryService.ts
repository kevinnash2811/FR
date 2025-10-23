import { accountsApi } from "@/connections/axiosCRM";
import type { AccountMarkerResponse, DeliveryResponse } from "@/types";
import { evalGeoLocation } from "@accounts/helpers";
import type {
  AdvancedFilter,
  Geolocation,
  PaginateOptions,
} from "@accounts/types";
import moment from "moment";

const getDeliveries = (options: PaginateOptions) =>
  accountsApi.post<DeliveryResponse[]>(
    "/hane-entregas/list",
    {
      page: options.page,
      rowsPerPage: options.rowsPerPage,
      filter: {
        ...options.filter,
        latlng: evalGeoLocation(options.withLocation),
        easyFilter: options.easyFilter,
        date: {
          from: moment().format("YYYY/MM/DD"),
          to: moment().format("YYYY/MM/DD"),
          ...options.filter?.date,
        },
      },
      sortBy: "nombre",
      order: "asc",
    },
    {
      signal: options.signal,
    },
  );

const getDeliveriesMarkers = (userId: string, signal?: AbortSignal) =>
  accountsApi.get<AccountMarkerResponse[]>(
    "/hane-entregas/all-hane_entregas-latlng",
    {
      signal,
      params: {
        iduser: userId,
      },
    },
  );

type GetTotalAccountsOptions = {
  withLocation: Geolocation;
  easyFilter: string;
  filter?: AdvancedFilter;
};

const getTotalDeliveries = (options: GetTotalAccountsOptions) =>
  accountsApi.post<number>("/hane-entregas/hane-entregas-total", {
    page: 1,
    rowsPerPage: 20,
    filter: {
      ...options.filter,
      latlng: evalGeoLocation(options.withLocation),
      easyFilter: options.easyFilter,
      date: {
        from: moment().format("YYYY/MM/DD"),
        to: moment().format("YYYY/MM/DD"),
        ...options.filter?.date,
      },
    },
    sortBy: "nombre",
    order: "asc",
  });

const getDeliveryById = async (idaccount: string) => {
  const { data } = await accountsApi.get(
    "/hane-entregas/hane-entregas-get-id",
    {
      params: {
        idaccount,
      },
    },
  );
  return data;
};

export {
  getDeliveries,
  getDeliveriesMarkers,
  getDeliveryById,
  getTotalDeliveries,
};
