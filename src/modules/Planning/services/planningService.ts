import { accountsApi } from "@/connections/axiosCRM";
import type { PlanningResponseAPI } from "@/modules/Planning/types";

export const getPlanningById = (id: string) => {
  return accountsApi.get<PlanningResponseAPI>(`hanrt_planificador/${id}`);
};