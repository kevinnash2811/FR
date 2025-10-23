import { accountsApi } from "@/connections/axiosCRM";
import type { FilterUsers } from "../types";

export const getTotalUsers = async (filter: FilterUsers, page: number, rowsPerPage: {value: number; label: string}) => {
  const response = await accountsApi.post<number>(
    "/users/users-total",
    {
      ...filter,
      page,
      rowsPerPage: rowsPerPage.value
    }
  );

  return response.data;
};