<script setup lang="ts">
import { computed, defineProps, defineModel, withDefaults } from "vue";
import { perPageOptions } from "@accounts/utils";
const { limit, length, label } = withDefaults(
  defineProps<{
    limit: number;
    length: number;
    label?: string;
  }>(),
  { label: "Registros" },
);

const page = defineModel<number>("page");
const rowsPerPage = defineModel<{
  label: string;
  value: number;
}>("rowsPerPage", {
  set: (value) => {
    page.value = 1;
    return value;
  },
});

const max = computed(() => {
  if (!rowsPerPage.value) return 1;
  const value = Math.ceil(limit / rowsPerPage.value.value);
  return value > 0 ? value : 1;
});
</script>

<template>
  <div
    class="row justify-between items-center q-px-sm"
    style="border-top: 1px solid gainsboro"
    v-if="page"
  >
    <div class="q-py-sm q-mx-auto" style="max-height: 50px">
      <q-pagination
        v-model="page"
        :max="max"
        input
        direction-links
        color="blue-10"
      ></q-pagination>
    </div>

    <div style="flex: 1" class="row q-gutter-x-md justify-end items-center">
      <div class="text-caption">{{ length }} {{ label }} de {{ limit }}</div>
      <q-select
        dense
        options-dense
        borderless
        v-model="rowsPerPage"
        :options="perPageOptions"
        class="text-caption"
      />
    </div>
  </div>
</template>

<style scoped></style>
