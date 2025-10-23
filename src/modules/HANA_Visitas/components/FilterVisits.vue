<script setup lang="ts">
import FilterWrapper from "@/components/FilterWrapper.vue";
import ListSelect from "@/components/ListSelect.vue";
import { useUserStore } from "@/store";
import { useAdvancedFilterVisitsStore } from "../store/useAdvancedFilterVisitsStore";

const userStore = useUserStore();
const filterStore = useAdvancedFilterVisitsStore();
</script>

<template>
  <filter-wrapper>
    <q-select
      dense
      outlined
      label="Supervisor"
      v-model="userStore.likeSelectableSupervisor"
      map-options
      emit-value
      option-value="value"
      option-label="label"
    ></q-select>
    <list-select
      dense
      outlined
      v-model="filterStore.filter.division"
      list="hansa_divisiones_list"
      label="Organización de ventas"
      clearable
    />
    <list-select
      dense
      outlined
      v-model="filterStore.filter.areaMercado"
      list="hansa_amercado_list"
      label="Sector"
      clearable
    />
    <list-select
      dense
      outlined
      v-model="filterStore.filter.regional"
      list="hansa_dimregional_list"
      label="Regional"
      clearable
    />
    <!-- <q-input v-model="showDateInput" outlined dense label="Fecha de creación">
      <template #append>
        <q-icon name="date_range">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-date
              v-model="dateRange"
              dense
              range
              :locale="localeDateFormat"
              mask="YYYY-MM-DD"
            >
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Cerrar" color="primary" flat />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input> -->
  </filter-wrapper>
</template>
