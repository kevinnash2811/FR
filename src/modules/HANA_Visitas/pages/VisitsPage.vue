<script setup lang="ts">
import HeaderPage from "@/components/HeaderPage.vue";
import { useDialogStore } from "@/store";
import { shallowRef } from "vue";
import FilterVisits from "../components/FilterVisits.vue";
import VisitListItem from "../components/VisitListItem.vue";
import { useAdvancedFilterVisitsStore } from "../store/useAdvancedFilterVisitsStore";
import { useQuery } from "@tanstack/vue-query";
import { getVisits, getVisitsTotal } from "../services";
import Pager from "@/components/Pager.vue";
import { usePagination } from "@/composables";
import LoadingList from "@/components/LoadingList.vue";

const filter = useAdvancedFilterVisitsStore();
const { page, rowsPerPage } = usePagination({
  page: 1,
  rowsPerPage: 20,
});
const dialogStore = useDialogStore();
const openFilterDialog = () => {
  dialogStore.openNewDrawer(shallowRef(FilterVisits));
};

const { data, isLoading, isFetching } = useQuery({
  queryKey: [
    "usersOfVisit",
    {
      filter,
      page,
      rowsPerPage,
    },
  ],
  queryFn: async () =>
    getVisits({
      filter: filter.filter,
      page: page.value,
      rowsPerPage: rowsPerPage.value.value,
    }),
  initialData: [],
});

const { data: totalVisits } = useQuery({
  queryKey: [
    "usersOfVisitTotal",
    {
      filter,
      page,
      rowsPerPage,
    },
  ],
  queryFn: async () =>
    getVisitsTotal({
      filter: filter.filter,
      page: page.value,
      rowsPerPage: rowsPerPage.value.value,
    }),
  initialData: 0,
});
</script>

<template>
  <div style="height: 100vh; max-height: 100vh" class="column no-wrap">
    <HeaderPage title="Mis Visitas Planificadas" />
    <div class="q-pa-sm">
      <q-input
        rounded
        outlined
        dense
        label="Buscar visita"
        debounce="2000"
        style="flex-grow: 1"
        v-model="filter.filter.easyFilter"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
        <template #after>
          <q-btn icon="filter_list" flat round dense @click="openFilterDialog">
            <q-badge color="orange" floating rounded></q-badge>
          </q-btn>
        </template>
        <template #append>
          <q-icon name="o_help_outline">
            <q-tooltip>
              Busqueda por: Nombre y codigo del cliente, Codigo y nombre del
              usuario
            </q-tooltip>
          </q-icon>
        </template>
      </q-input>
    </div>
    <div style="flex-grow: 1; overflow: hidden">
      <loading-list
        :isLoading="isLoading || isFetching"
        :isEmpty="false"
        emptyMessage="No hay visitas"
      >
        <q-virtual-scroll
          style="max-height: 100%"
          :items="data"
          v-slot="{ item }"
        >
          <visit-list-item :item="item"></visit-list-item>
        </q-virtual-scroll>
      </loading-list>
    </div>
    <Pager
      v-if="!isLoading && !isFetching"
      v-model:page="page"
      v-model:rows-per-page="rowsPerPage"
      :limit="totalVisits"
      :length="data.length"
      label="Visitas planificadas"
    />
  </div>
</template>

<style scoped></style>
