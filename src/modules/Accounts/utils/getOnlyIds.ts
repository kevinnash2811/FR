import type { Account } from "@/types";

export const getOnlyIds = (accounts: Account[]) => {
  return accounts.filter((a) => !!a.location).map((a) => a.id);
};
