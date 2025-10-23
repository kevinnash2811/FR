<script setup lang="ts">
const { emptyMessage, isEmpty, isLoading } = defineProps<{
  isLoading: boolean;
  isEmpty: boolean;
  emptyMessage: string;
}>();
</script>

<template>
  <div
    v-if="isLoading"
    class="row items-center justify-center"
    style="height: 100%"
  >
    <q-spinner-dots color="primary" size="3em" class="" />
  </div>
  <div
    v-else-if="isEmpty"
    class="row items-center justify-center"
    style="height: 100%"
  >
    {{ emptyMessage }}
  </div>
  <slot v-else></slot>
</template>

<style scoped></style>
