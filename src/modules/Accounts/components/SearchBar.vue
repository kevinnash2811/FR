<script setup lang="ts">
import { defineEmits, defineModel, defineProps, withDefaults } from "vue";

const { showBadge } = withDefaults(
  defineProps<{
    showBadge: boolean;
    helpText: string;
    searchText: string;
    debounce?: number | string;
  }>(),
  {
    debounce: 200,
  },
);

const filter = defineModel<string>();

const emit = defineEmits<(e: "open-filter") => void>();
</script>

<template>
  <q-input
    outlined
    v-model="filter"
    rounded
    dense
    :label="searchText"
    :debounce="debounce"
    style="flex-grow: 1"
  >
    <template #after>
      <q-btn round flat @click="emit('open-filter')" icon="o_filter_list">
        <q-badge v-if="showBadge" color="orange" floating rounded></q-badge>
      </q-btn>
    </template>
    <template #prepend>
      <q-icon name="search" />
    </template>
    <template #append>
      <q-icon name="o_help_outline">
        <q-tooltip>
          {{ helpText }}
        </q-tooltip>
      </q-icon>
    </template>
  </q-input>
</template>

<style scoped></style>
