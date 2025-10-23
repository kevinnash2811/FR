import { accountsApi } from "@/connections/axiosCRM";
import type {
  VisitsOptions,
  VisitsResponse,
} from "@/modules/HANA_Visitas/types";

export const getVisits = async (options: VisitsOptions) => {
  try {
    const response = await accountsApi.post<VisitsResponse[]>(
      "/hanrt_planificador/hanrt_itemruta_list",
      options,
      {
        signal: options.signal,
      },
    );
    const data = response.data;
    return data;
  } catch (error) {
    console.error("Error fetching visits:", error);
    throw error;
  }
};
export const getVisitsTotal = async (options: VisitsOptions) => {
  try {
    const response = await accountsApi.post<number>(
      "/hanrt_planificador/hanrt_itemruta_total",
      options,
      {
        signal: options.signal,
      },
    );
    const data = response.data;
    return data;
  } catch (error) {
    console.error("Error fetching visits:", error);
    throw error;
  }
};
