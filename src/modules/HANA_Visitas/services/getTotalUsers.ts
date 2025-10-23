import { accountsApi } from "@/connections/axiosCRM";
import type { FilterUsers } from "../types";

export const getTotalUsers = async (filter: FilterUsers) => {
  const response = await accountsApi.post<number>(
    "/users/users-total",
    filter,
  );

  return response.data;
};