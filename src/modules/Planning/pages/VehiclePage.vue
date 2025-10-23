<script setup lang="ts">
import { accountsApi } from "@/connections/axiosCRM";
import { useDialogStore } from "@/store";
import { useInfiniteQuery, useQuery } from "@tanstack/vue-query";
import { useQuasar } from "quasar";
import { computed, defineAsyncComponent, shallowRef } from "vue";
import { useCreatePlanningStore } from "../store";
import { useAdvancedFilterVehicleStore } from "../store/useAdvancedFilterVehicleStore";
import type { Vehicle, VehicleAPIResponse } from "../types";
import FilterVehicles from "../components/FilterVehicles.vue";

const HeaderPage = defineAsyncComponent(
  () => import("@/components/HeaderPage.vue"),
);

const createPlanningStore = useCreatePlanningStore();
const advancedFilterVehicleStore = useAdvancedFilterVehicleStore();
const dialogStore = useDialogStore();
const $q = useQuasar();
const {
  isLoading: isLoadingTotalVehicles,
  isFetching: isFetchingTotalVehicles,
  data,
} = useQuery<number>({
  queryKey: ["totalVehicles", advancedFilterVehicleStore.filter],
  queryFn: async () => {
    const { data } = await accountsApi.post<number>(
      "/hans_vehiculos/hans-vehiculos-total",
      {
        page: 1,
        rowsPerPage: 20,
        filter: advancedFilterVehicleStore.filter,
        sortBy: "fecha_creacion",
        order: "desc",
      },
    );
    return data;
  },
});
const enabled = computed(
  () => !isLoadingTotalVehicles.value && !isFetchingTotalVehicles.value,
);

const infinityGetVehicles = useInfiniteQuery({
  queryKey: ["vehicles", advancedFilterVehicleStore.filter],
  initialPageParam: 1,
  queryFn: async ({ pageParam }) => {
    const { data } = await accountsApi.post<VehicleAPIResponse[]>(
      "/hans_vehiculos/list",
      {
        page: pageParam,
        rowsPerPage: 20,
        filter: advancedFilterVehicleStore.filter,
        sortBy: "fecha_creacion",
        order: "desc",
      },
    );
    return data;
  },
  getNextPageParam: (lastPage, allPages) => {
    if (data.value === allPages.flat().length) {
      return null;
    }
    return allPages.length + 1;
  },
  enabled,
});
const vehicles = computed(
  () =>
    infinityGetVehicles.data.value?.pages.flat()
);

const onSelectedVehicle = (value: boolean, vehicle: VehicleAPIResponse) => {
  if (value) {
    if (!vehicle.conductores?.length) {
      $q.dialog({
        title: "Vehiculo sin conductor",
        message:
          "El vehiculo seleccionado no tiene conductor asignado, ¿Desea continuar?",
        ok: {
          color: "primary",
          label: "Si",
        },
        cancel: {
          color: "negative",
          label: "No",
        },
      }).onOk(() => {
        createPlanningStore.addVehicle(vehicle);
      });
    } else {
      createPlanningStore.addVehicle(vehicle);
    }
  } else {
    createPlanningStore.removeVehicle(vehicle);
  }
};

const openFilterVehicle = () => {
  dialogStore.openNewDrawer(shallowRef(FilterVehicles));
};

const load = (index: number, done: (stop?: boolean) => void) => {
  if (infinityGetVehicles.hasNextPage) {
    infinityGetVehicles.fetchNextPage().then(() => {
      done();
    });
  } else {
    done(true);
  }
};

const isAdded = computed(() => {
  return (vehicle: Vehicle) =>
    createPlanningStore.assignedVehicles.some((v) => v.id === vehicle.id);
});

const isLoading = computed(
  () =>
    infinityGetVehicles.isLoading ||
    infinityGetVehicles.isFetching ||
    isLoadingTotalVehicles.value ||
    isFetchingTotalVehicles.value,
);
</script>

<template>
  <div class="column no-wrap" style="height: 100vh; max-height: 100vh">
    <HeaderPage title="Vehiculos" closePopUp />
    <div class="q-px-sm">
      <q-input
        outlined
        dense
        rounded
        label="Placa | Nombre de chofer"
        debounce="500"
        v-model="advancedFilterVehicleStore.filter.easyFilter"
      >
        <template #after>
          <q-btn round flat icon="filter_list" @click="openFilterVehicle" />
        </template>
      </q-input>
    </div>
    <div style="flex-grow: 1">
      <template v-if="isLoading.value">
        <div class="row items-center justify-center" style="height: 100%">
          <q-spinner-dots color="primary" size="40px" />
        </div>
      </template>
      <template v-else-if="vehicles?.length === 0">
        <div class="row justify-center items-center" style="height: 100%">
          No se encontraron vehículos
        </div>
      </template>
      <q-infinite-scroll
        v-else
        @load="load"
        :offset="50"
        :disable="!infinityGetVehicles.hasNextPage.value"
      >
        <q-virtual-scroll :items="vehicles" v-slot="{ item }" class="q-pa-xs">
          <q-expansion-item
            expand-icon-toggle
            :dark="isAdded(item)"
            :header-class="{
              'bg-primary': isAdded(item),
              'q-pa-none q-ma-none': true,
            }"
          >
            <template #header>
              <q-item
                clickable
                v-ripple
                @click="onSelectedVehicle(!isAdded(item), item)"
                style="width: 100%"
              >
                <q-item-section avatar>
                  <q-avatar
                    color="primary"
                    :style="{
                      outline: isAdded(item)
                        ? '1px solid white'
                        : '2px solid transparent',
                    }"
                  >
                    <q-icon name="directions_car" color="white"></q-icon>
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    {{ item.name }}
                  </q-item-label>
                  <q-item-label caption>
                    <template v-if="item.conductores?.length > 0">
                      <q-badge
                        rounded
                        color="orange"
                        :label="item.conductores?.length"
                      ></q-badge>
                      Conductores asignados
                    </template>
                    <template v-else>Sin conductores asignados</template>
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-chip
                    size="sm"
                    :color="
                      item.estado_vehiculo_c === 'E01' ? 'blue-6' : 'red-6'
                    "
                    text-color="white"
                    class="q-mx-none"
                    square
                    >{{ item.estado_vehiculo_label }}</q-chip
                  >
                  <q-item-label caption>
                    <template v-if="item.capacidad_1_c">
                      Capacidad: {{ item.capacidad_1_c }}
                    </template>
                    <template v-else> Sin capacidad </template>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <q-list v-if="item.conductores?.length">
              <q-item v-for="driver of item.conductores" :key="driver.user_id">
                <q-item-section avatar>
                  <q-avatar>
                    <q-icon
                      name="airline_seat_recline_normal"
                      color="primary"
                    ></q-icon>
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ driver.user_name }}</q-item-label>
                  <q-item-label caption>{{ driver.tipo_c_label }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label caption>{{ driver.name }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <q-item v-else>
              <q-item-section>
                <q-item-label caption> Sin conductores asignados </q-item-label>
              </q-item-section>
            </q-item>
          </q-expansion-item>
        </q-virtual-scroll>

        <template v-slot:loading>
          <div class="row justify-center q-my-md">
            <q-spinner-dots color="primary" size="40px" />
          </div>
        </template>
      </q-infinite-scroll>
    </div>
  </div>
</template>
