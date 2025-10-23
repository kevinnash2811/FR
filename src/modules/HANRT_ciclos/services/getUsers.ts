import { accountsApi } from "@/connections/axiosCRM";
import type { FilterUsers, UsersResponse } from "../types";

export const getUsers = async (
  filter: FilterUsers,
  page: number,
  rowsPerPage: { value: number; label: string },
) => {
  const response = await accountsApi.post<UsersResponse[]>("/users/list", {
    ...filter,
    page,
    rowsPerPage: rowsPerPage.value,
  });

  return response.data;
};
