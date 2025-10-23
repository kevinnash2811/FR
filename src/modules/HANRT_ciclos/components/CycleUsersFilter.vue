<script setup lang="ts">
import FilterWrapper from "@/components/FilterWrapper.vue";
import ListSelect from "@/components/ListSelect.vue";
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
      v-model="filter.filter.iddivision_c"
      list="hansa_divisiones_list"
      label="Organización de ventas"
      clearable
    />
    <list-select
      dense
      outlined
      v-model="filter.filter.idamercado_c"
      list="hansa_amercado_list"
      label="Sector"
      clearable
    />
    <list-select
      dense
      outlined
      v-model="filter.filter.idregional_c"
      list="hansa_dimregional_list"
      label="Regional"
      clearable
    />
  </filter-wrapper>
</template>

<style scoped></style>
