<script setup lang="ts">
import { useDragAndDropTableRow } from "../composables/useDragAndDropTableRow";
import type { PrimitiveRoute } from "../types";
import { getColorByCategory } from "@/utils";

const routes = defineModel<PrimitiveRoute[]>();
const { draggedIndex, onDragEnd, onDragOver, onDragStart, onDrop, overIndex } =
  useDragAndDropTableRow((from, to) => emit("swap", from, to));

const emit = defineEmits<{
  (e: "swap", from: number, to: number): void;
}>();
</script>

<template>
  <q-list class="text-left row" v-for="(route, index) in routes" :key="index">
    <q-item
      style="width: 100%"
      clickable
      v-ripple:primary
      @click="() => {}"
      @dragend="onDragEnd"
      @dragover.prevent="onDragOver(index, $event)"
      @drop="onDrop(index, $event)"
      :class="{
        'bg-grey-5': draggedIndex === index,
        'bg-grey-2': overIndex === index,
      }"
    >
      <q-item-section avatar>
        <div>
          <q-icon
            @dragstart="onDragStart(index, $event)"
            name="drag_handle"
            size="sm"
            draggable="true"
            :color="getColorByCategory(route.customer.category)"
          />
          <q-icon
            name="o_location_on"
            size="sm"
            :color="getColorByCategory(route.customer.category)"
          />
        </div>
      </q-item-section>
      <q-item-section top>
        <q-item-label lines="1">
          {{ route.customer.address }}
        </q-item-label>
        <q-item-label caption lines="1">
          {{ route.customer.name }}
        </q-item-label>
        <q-item-label lines="1">
          <q-chip
            :clickable="false"
            :ripple="false"
            square
            color="primary"
            outline
            dense
            class="q-ma-none"
          >
            <q-avatar icon="o_access_time" />
            {{ route.hourOfInit }} - {{ route.hourOfEnd }}
          </q-chip>
        </q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<style scoped></style>
