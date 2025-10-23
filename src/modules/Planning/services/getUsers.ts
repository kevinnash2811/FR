import { accountsApi } from "@/connections/axiosCRM";
import type { UserAccount } from "@/types";

export const getUsers = async ({
  amercado, division
}: {
  division: string;
  amercado: string;
}) => {
  const { data } = await accountsApi.get<UserAccount[]>("/users", {
    params: {
      division,
      amercado,
    },
  });
  return data;
}
