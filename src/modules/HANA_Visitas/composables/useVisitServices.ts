import { accountsApi } from "@/connections/axiosCRM"
import { useMutation } from "@tanstack/vue-query"
import type { AxiosResponse } from "axios";

type CreateCycle = {
 name: string;
  description: string;
  dateOfInit: string;
  dateOfEnd: string;
  days: number;
  visitPerDay: number;
  hourPerDay: number;
  region: string;
  state: string;
  iddivision: string;
  idamercado: string;
  userId: string; 
  users: string[];
}

export const useVisitServices =() => {

  const { mutateAsync: createCycle, isPending: isPendingCreateCycle } = useMutation<
    AxiosResponse,
    Error,
    CreateCycle
  >({
    mutationFn: async (createCycle) => {
      return accountsApi.post("/hanrt_planificador/hanrt_itemruta_total", createCycle);
    },
  });

  return {
    createCycle,
    isPendingCreateCycle,
  };
}