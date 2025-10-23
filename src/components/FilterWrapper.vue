<script setup lang="ts">
import { useDialogStore } from '@/store';

const dialogStore = useDialogStore();
const { subtitle, title } = withDefaults(
  defineProps<{
    title?: string;
    subtitle?: string;
  }>(),
  {
    title: "Búsqueda",
    subtitle: "Avanzada",
  },
);

// const emit = defineEmits<{
//   (e: 'close'): void;
// }>();

const close = () => {
  dialogStore.closeCurrentDrawer();
}

</script>

<template>
  <div class="bg-primary text-white row items-center justify-between q-px-md">
    <div class="q-pa-sm row items-center q-gutter-x-md">
      <q-icon name="filter_alt" color="white" size="2rem"></q-icon>
      <div>
        <div class="text-h4">{{ title }}</div>
        <div class="text-caption">{{ subtitle }}</div>
      </div>
    </div>
    <div>
      <q-icon
        class="cursor-pointer"
        name="close"
        color="white"
        size="1.5rem"
        @click="close"
      >
        <q-tooltip> Cerrar </q-tooltip>
      </q-icon>
    </div>
  </div>
  <div
    class="q-pa-sm column no-wrap"
    style="flex-grow: 1; overflow-y: scroll; gap: 10px"
  >
    <slot></slot>
  </div>
  <div class="row justify-center q-gutter-x-md q-pa-sm shadow-14">
    <q-btn outline color="primary" icon="search" @click="close"
      >Buscar</q-btn
    >
    <q-btn outline color="primary" icon="filter_alt_off">Limpiar</q-btn>
  </div>
</template>

<style scoped></style>
