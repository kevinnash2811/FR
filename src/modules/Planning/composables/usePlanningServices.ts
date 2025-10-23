import { accountsApi } from "@/connections/axiosCRM";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import type { AxiosResponse } from "axios";
import { useCreatePlanningStore } from "../store";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { computed } from "vue";

export const usePlanningServices = () => {
  const queryClient = useQueryClient();
  const createPlanningStore = useCreatePlanningStore();
  const $q = useQuasar();
  const router = useRouter();

  const { mutateAsync: createPlanning, isPending: isPendingCreatePlanning } =
    useMutation<AxiosResponse, Error>({
      mutationKey: ["createPlanning"],
      mutationFn() {
        return accountsApi.post(
          "hanrt_planificador/save",
          createPlanningStore.toSend(),
        );
      },
      onError(error) {
        $q.notify({
          type: "negative",
          message: error.message,
        });
      },
      onSuccess() {
        $q.notify({
          type: "positive",
          message: "Planificación creada correctamente",
        });
        createPlanningStore.clearFields();
        router.push({
          name: "hanrt_planificador",
        });
      },
    });

  const { mutateAsync: updatePlanning, isPending: isPendingUpdatePlanning } =
    useMutation<AxiosResponse, Error>({
      mutationKey: ["updatePlanning"],
      mutationFn() {
        return accountsApi.post(
          `hanrt_planificador/updatePlanning`,
          createPlanningStore.toUpdate(),
        );
      },
      onError(error) {
        $q.notify({
          type: "negative",
          message: error.message,
        });
      },
      onSuccess() {
        $q.notify({
          type: "positive",
          message: "Planificación actualizada correctamente",
        });
        createPlanningStore.clearFields();
        router.push({
          name: "hanrt_planificador",
        });
      },
    });

  const {
    mutateAsync: changePlanningState
  } = useMutation<AxiosResponse, unknown, { id: string; estado: string }>({
    mutationKey: ["updatePlanningState"],
    mutationFn: async ({ estado, id }) => {
      return accountsApi.patch(`/hanrt_planificador/state/${id}`, {
        estado,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        predicate(query) {
          return query.queryKey[0] === "planningList";
        },
      })
    }
  });

  const { mutateAsync: sendToQueue } = useMutation<
    AxiosResponse,
    unknown,
    { id: string }
  >({
    mutationKey: ["sendToQueue"],
    mutationFn: async ({ id }) => {
      return accountsApi.post(`/producer_rabbit/planificador`, {
        idPlanificacion: id,
      });
    },
  });

  const {
    mutateAsync: duplicatePlanning,
    isPending: isPendingDuplicatePlanning,
  } = useMutation<AxiosResponse, Error, { name?: string }>({
    mutationKey: ["duplicatePlanning"],
    mutationFn({ name }) {
      const data = createPlanningStore.toSend();

      data.hanrtPlanificadorData.name =
        name ?? `${data.hanrtPlanificadorData.name} - Copia`;
      data.hanrtPlanificadorData.estadoPlanificacionC = "EP01";

      return accountsApi.post("hanrt_planificador/save", data);
    },
    onError(error) {
      $q.notify({
        type: "negative",
        message: error.message,
      });
    },
    onSuccess() {
      $q.notify({
        type: "positive",
        message: "Planificación duplicada correctamente",
      });
      createPlanningStore.clearFields();
      router.push({
        name: "hanrt_planificador",
      });
    },
  });

  const { mutateAsync: deletePlanning, isPending: isPendingDeletePlanning } =
    useMutation({
      mutationKey: ["delete"],
      mutationFn() {
        return accountsApi.delete(
          `hanrt_planificador/delete/${createPlanningStore.id}`,
        );
      },
      onError(error) {
        $q.notify({
          type: "negative",
          message: error.message,
        });
      },
      onSuccess() {
        $q.notify({
          type: "positive",
          message: "Planificación eliminada correctamente",
        });
        createPlanningStore.clearFields();
        router.push({
          name: "hanrt_planificador",
        });
      },
    });

  const isLoading = computed(
    () =>
      isPendingCreatePlanning.value ||
      isPendingUpdatePlanning.value ||
      isPendingDuplicatePlanning.value ||
      isPendingDeletePlanning.value,
  );

  return {
    createPlanning,
    isPendingCreatePlanning,
    updatePlanning,
    isPendingUpdatePlanning,
    changePlanningState,
    duplicatePlanning,
    isPendingDuplicatePlanning,
    sendToQueue,
    deletePlanning,
    isPendingDeletePlanning,
    isLoading,
  };
};
