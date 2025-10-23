<script setup lang="ts">
import HeaderPage from "@/components/HeaderPage.vue";
import LoadingList from "@/components/LoadingList.vue";
import Pager from "@/components/Pager.vue";
import { usePagination } from "@/composables";
import { accountsApi } from "@/connections/axiosCRM";
import { useCreatePlanningStore } from "@/modules/Planning/store";
import { useUserStore } from "@/store/useUserStore";
import { Module } from "@accounts/types";
import { existSomeValue } from "@accounts/utils";
import { useQuery } from "@tanstack/vue-query";
import type { AxiosError } from "axios";
import { useRouter } from "vue-router";
import ListPlanningItem from "../components/ListPlanningItem.vue";
import { useAdvancedFilterPlanningStore } from "../store/useAdvancedFilterPlanningStore";
import type { PlanningResponse } from "../types";
import { useDialogStore } from "@/store";
import { shallowRef } from "vue";
import FilterPlanning from "../components/FilterPlanning.vue";
import moment from "moment";
const userStore = useUserStore();
const createPlanningStore = useCreatePlanningStore();
const filterAdvancedPlanning = useAdvancedFilterPlanningStore();
const dialogStore = useDialogStore();
const { page, rowsPerPage } = usePagination({ rowsPerPage: 20 });
const router = useRouter();

const openFilterPlanning = () => {
  dialogStore.openNewDrawer(shallowRef(FilterPlanning));
};

const { data: totalPlanning } = useQuery({
  queryKey: ["totalPlanning", page, rowsPerPage, filterAdvancedPlanning.filter],
  queryFn: async () => {
    let date = filterAdvancedPlanning.filter.date;

    if (typeof filterAdvancedPlanning.filter.date === "string") {
      console.log("Filter date is string");
      date = {
        from: filterAdvancedPlanning.filter.date,
        to: filterAdvancedPlanning.filter.date,
      };
    }

    if (!date) {
      date = {
        from: "",
        to: "",
      };
    }

    const { data } = await accountsApi.post<number>(
      "/hanrt_planificador/hanrt_planificador_total",
      {
        page: page.value,
        rowsPerPage: rowsPerPage.value.value,
        filter: {
          assigned_to: filterAdvancedPlanning.filter.creado_por,
          name: filterAdvancedPlanning.filter.nombre,
          description: "",
          tipo: filterAdvancedPlanning.filter.tipo,
          iddivisionC: filterAdvancedPlanning.filter.division,
          idamercadoC: filterAdvancedPlanning.filter.sector,
          regionC: filterAdvancedPlanning.filter.regional,
          estadoPlanificacionC: filterAdvancedPlanning.filter.estado,
          fechaInicioC: moment(date.from, 'DD/MMMM/YYYY').format('YYYY-MM-DD'),
          fechaFinC: moment(date.to, 'DD/MMMM/YYYY').format('YYYY-MM-DD'),
        },
      },
    );
    return data;
  },
  initialData: 0,
  refetchOnWindowFocus: false,
});

const {
  data: planningList,
  isLoading: isLoadingPlannings,
  isFetching: isFetchingPlannings,
} = useQuery<PlanningResponse[], AxiosError>({
  queryKey: ["planningList", page, rowsPerPage, filterAdvancedPlanning.filter],
  queryFn: async () => {
    let date = filterAdvancedPlanning.filter.date;

    if (typeof filterAdvancedPlanning.filter.date === "string") {
      date = {
        from: filterAdvancedPlanning.filter.date,
        to: filterAdvancedPlanning.filter.date,
      };
    }

    if (!date) {
      date = {
        from: "",
        to: "",
      };
    }

    const { data } = await accountsApi.post<PlanningResponse[]>(
      "/hanrt_planificador/list",
      {
        page: page.value,
        rowsPerPage: rowsPerPage.value.value,
        filter: {
          assigned_to: filterAdvancedPlanning.filter.creado_por,
          name: filterAdvancedPlanning.filter.nombre ?? "",
          description: "",
          tipo: filterAdvancedPlanning.filter.tipo ?? "",
          iddivisionC: filterAdvancedPlanning.filter.division ?? "",
          idamercadoC: filterAdvancedPlanning.filter.sector ?? "",
          regionC: filterAdvancedPlanning.filter.regional ?? "",
          estadoPlanificacionC: filterAdvancedPlanning.filter.estado ?? "",
          fechaInicioC: moment(date.from, 'DD/MMMM/YYYY').format('YYYY-MM-DD'),
          fechaFinC: moment(date.to, 'DD/MMMM/YYYY').format('YYYY-MM-DD'),
        },
      },
    );
    return data;
  },
  initialData: [],
  refetchOnWindowFocus: false,
});

const goToVisitModule = async () => {
  if (userStore.user) {
    await createPlanningStore.setUserForVisitPlanning(userStore.user);
    router.push({
      name: "create",
      params: { type: Module.VISIT },
    });
  }
};

const goToDeliveryModule = async () => {
  if (userStore.user) {
    await createPlanningStore.setUserForDeliveryPlanning(userStore.user);
    router.push({
      name: "create",
      params: { type: Module.DISPATCH },
    });
  }
};
</script>

<template>
  <div class="column no-wrap" style="height: 100vh; max-height: 100vh">
    <HeaderPage title="Planificaciones" />
    <div class="row no-wrap items-center q-px-sm q-pb-xs" style="gap: 10px">
      <q-input
        rounded
        outlined
        style="flex-grow: 1"
        v-model.trim="filterAdvancedPlanning.filter.nombre"
        label="Buscar planificación"
        debounce="2000"
        dense
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
        <template #after>
          <q-btn
            color="blue-10"
            icon="group_add"
            dense
            @click="goToVisitModule"
            v-if="userStore.canViewModuleVisit"
          >
            <q-tooltip>Crear planificación de visitas</q-tooltip>
          </q-btn>
          <q-btn
            color="orange"
            icon="local_shipping"
            dense
            @click="goToDeliveryModule"
            v-if="userStore.canViewModuleDelivery"
          >
            <q-tooltip>Crear planificación de distribución</q-tooltip>
          </q-btn>
          <q-btn icon="filter_list" flat dense @click="openFilterPlanning">
            <q-badge
              v-if="existSomeValue(filterAdvancedPlanning.filter)"
              color="orange"
              class="q-ml-xs"
              floating
              rounded
            >
            </q-badge>
          </q-btn>
        </template>
      </q-input>
    </div>
    <div style="flex-grow: 1; overflow: hidden">
      <loading-list
        :isLoading="isLoadingPlannings || isFetchingPlannings"
        :isEmpty="planningList?.length === 0"
        emptyMessage="No hay planificaciones"
      >
        <q-virtual-scroll
          class="q-mr-xs"
          :items="planningList"
          style="height: 100%"
          v-slot="{ item }"
          :items-size="planningList.length"
        >
          <list-planning-item :item="item" />
        </q-virtual-scroll>
      </loading-list>
    </div>
    <Pager
      v-if="!isLoadingPlannings && !isFetchingPlannings"
      :limit="totalPlanning"
      :length="planningList.length"
      v-model:page="page"
      v-model:rows-per-page="rowsPerPage"
    />
  </div>
</template>

<style scoped>
.drag-indicator:hover {
  cursor: grab;
}
</style>
