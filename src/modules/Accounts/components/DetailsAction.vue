<script setup lang="ts">
import { useLocationAccount } from "@accounts/composables";
import { useSelectedAccountStore } from "@accounts/store";
import type { ClientDetailResponse } from "@accounts/types";
const tenantDomain = import.meta.env.VITE_TENANT_DOMAIN as string;
const { detail } = defineProps<{
  detail: ClientDetailResponse;
}>();

const selectedAccountStore = useSelectedAccountStore();
const { onCreateLocation, onDeleteLocation, onEditLocation } =
  useLocationAccount(detail);
</script>

<template>
  <template v-if="selectedAccountStore.hasLocation">
    <q-btn
      icon="o_edit_location_alt"
      color="blue-10"
      flat
      noCaps
      stack
      style="flex: 1"
      @click="onEditLocation"
    >
      Editar ubicación</q-btn
    >
    <q-btn
      icon="o_location_off"
      color="blue-10"
      flat
      noCaps
      stack
      style="flex: 1"
      @click="onDeleteLocation"
    >
      Borrar ubicación</q-btn
    >
  </template>
  <template v-else>
    <q-btn
      icon="o_add_location_alt"
      color="blue-10"
      flat
      noCaps
      stack
      style="flex: 1"
      @click="onCreateLocation"
    >
      Agregar ubicación</q-btn
    >
  </template>
  <q-btn icon="o_visibility" color="blue-10" flat noCaps stack style="flex: 1" target="_blank" :href="`${tenantDomain}/index.php?module=Accounts&return_module=Accounts&action=DetailView&record=${selectedAccountStore.getSelectedAccount?.id}`">
    Ver cuenta</q-btn
  >
</template>

<style scoped></style>
