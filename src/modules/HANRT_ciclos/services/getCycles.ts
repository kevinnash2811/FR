import { accountsApi } from "@/connections/axiosCRM"
import type { CycleReponse } from "../types";

export const getCycles = async () => {
  const response = await accountsApi.post<CycleReponse[]>("/hanrt_ciclos/list");
  return response.data;
}