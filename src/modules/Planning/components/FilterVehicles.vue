<script setup lang="ts">
import ListSelect from "@/components/ListSelect.vue";
import UserAvatar from "@/components/UserAvatar.vue";
import FilterWrapper from "@/components/FilterWrapper.vue";
import { useAdvancedFilterVehicleStore } from "../store/useAdvancedFilterVehicleStore";
import { accountsApi } from "@/connections/axiosCRM";
import { useQuery } from "@tanstack/vue-query";
import type { DriverResponse } from "../types";
const advancedFilterVehicleStore = useAdvancedFilterVehicleStore();

const { data: drivers } = useQuery({
  queryKey: ["getDrivers"],
  queryFn: async () => {
    const { data } = await accountsApi.get<DriverResponse[]>(
      "/hanrt_conductor/list",
    );
    return data;
  },
});
</script>

<template>
  <filter-wrapper>
    <list-select
      list="hansa_dimregional_list"
      label="Regional"
      v-model="advancedFilterVehicleStore.filter.regional"
      outlined
      dense
      clearable
    ></list-select>
    <list-select
      v-model="advancedFilterVehicleStore.filter.state"
      list="hansa_estado_vehiculo_list_c"
      clearable
      label="Estado"
      outlined
      dense
    ></list-select>
    <q-select
      clearable
      label="Chofer"
      outlined
      dense
      v-model="advancedFilterVehicleStore.filter.assigned_to"
      :options="drivers"
      option-value="assigned_to"
      option-label="name_conductor"
      map-options
      emit-value
    >
      <template #option="{ opt, itemProps }">
        <q-item clickable v-ripple v-bind="itemProps">
          <q-item-section avatar>
            <user-avatar :avatar="opt.avatar"></user-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ opt.name_conductor }}</q-item-label>
            <q-item-label caption>{{ opt.alias_conductor }}</q-item-label>
          </q-item-section>
          <q-item-section top side>
            <q-item-label caption>{{ opt.division }}</q-item-label>
            <q-item-label caption>{{ opt.amercado }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </filter-wrapper>
</template>

<style scoped></style>
