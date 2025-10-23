<template>
  <div class="q-mb-sm q-pa-sm">
    <div class="row justify-between items-center q-py-sm">
      <div class="text-h5 text-grey-7 text-bold">Rutas</div>
      <!-- <q-btn @click="navStore.close" class="q-py-none q-px-xs bg-gray-4" flat>
        <q-icon name="o_arrow_back_ios"></q-icon>
      </q-btn> -->
    </div>
  </div>
  <q-tabs
    indicator-color="transparent"
    inline-label
    active-color="black"
    v-model="tab"
    dense
    no-caps
    class="bg-gray-5 text-grey-6 shadow-2 q-mb-sm"
  >
    <q-tab name="current" label="Ruta actual" />
    <q-tab name="saveRoutes" label="Rutas guardadas" />
  </q-tabs>
  <q-tab-panels v-model="tab" animated>
    <q-tab-panel name="current" class="q-gutter-y-sm q-pa-none">
      <div class="column items-center">
        <div>
          <img
            width="100%"
            src="https://www.dispatchtrack.com/hs-fs/hubfs/best%20route%20optimization%20software.webp?width=1800&name=best%20route%20optimization%20software.webp"
          />
        </div>
        <div class="">
          <q-btn class="bg-blue-7 text-white" padding="sm xl">
            <q-icon name="o_add" size=".8rem"></q-icon>
            <div>Crear ruta</div>
          </q-btn>
        </div>
      </div>
    </q-tab-panel>
    <q-tab-panel name="saveRoutes" class="q-gutter-y-sm q-pa-sm">
      Rutas guardadas
    </q-tab-panel>
  </q-tab-panels>
</template>

<script setup lang="ts">
import { ref } from "vue";

const tab = ref("current");
</script>

<style scoped>
/* * {
  outline: 1px solid red;
} */
</style>
