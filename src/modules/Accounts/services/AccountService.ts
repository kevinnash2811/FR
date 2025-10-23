import { accountsApi } from "@/connections/axiosCRM";
import type { AccountMarkerResponse, AccountResponse } from "@/types";
import {
  Geolocation,
  type AdvancedFilter,
  type PaginateOptions,
} from "@accounts/types";
import { evalGeoLocation } from "@accounts/helpers";

const getAccounts = (options: PaginateOptions) =>
  accountsApi.post<AccountResponse[]>(
    "/accounts/list",
    {
      page: options.page,
      rowsPerPage: options.rowsPerPage,
      filter: {
        ...options.filter,
        latlng: evalGeoLocation(options.withLocation),
        easyFilter: options.easyFilter,
      },
      sortBy: "nombre",
      order: "asc",
    },
    {
      signal: options.signal,
    },
  );

const getAccountMarkers = (userId?: string, signal?: AbortSignal) =>
  accountsApi.get<AccountMarkerResponse[]>("/accounts/all-accounts-latlng", {
    signal,
    params: {
      iduser: userId,
    },
  });

type GetTotalAccountsOptions = {
  withLocation: Geolocation;
  easyFilter: string;
  filter?: AdvancedFilter;
};

const getTotalAccounts = (options: GetTotalAccountsOptions) =>
  accountsApi.post<number>("/accounts/accounts-total", {
    page: 1,
    rowsPerPage: 20,
    filter: {
      ...options.filter,
      latlng: evalGeoLocation(options.withLocation),
      easyFilter: options.easyFilter,
    },
    sortBy: "nombre",
    order: "asc",
  });

const getAccountById = async (idaccount: string) => {
  const { data } = await accountsApi.get("/accounts/account-get-id", {
    params: {
      idaccount,
    },
  });
  return data;
};

export { getAccounts, getTotalAccounts, getAccountMarkers, getAccountById };
