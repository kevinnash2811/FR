import { accountsApi } from "@/connections/axiosCRM"
import type { Activity } from "@planning/types"

export const getActivities = (type: string, taskFor: string,fechaInicio: string, fechaFin: string) => {
  return accountsApi.get<Activity[]>('/hanrt_tareasplan/listTareasPlan', {
    params: {
      tipoTarea: type,
      tareaPara: taskFor,
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
      
    },
  })
}
