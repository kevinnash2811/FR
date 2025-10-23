import { accountsApi } from "@/connections/axiosCRM";
import type { FilterUsers, UsersResponse } from "../types";

export const getUsers = async (filter: FilterUsers) => {
  const response =  await accountsApi.post<UsersResponse[]>("/users/list", filter);

  return response.data;
};
