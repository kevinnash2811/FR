<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string;
  showAddButton?: boolean;
}>(), {
  showAddButton: true,
});

const onAddClick = () => {
  emit("add");
};

const emit = defineEmits<{
  (e: "add"): void;
}>();
</script>

<template>
  <div class="row items-center justify-between">
    <div class="row items-center" style="gap: 5px">
      {{ props.title }}
    </div>
    <div v-if="props.showAddButton">
      <q-btn
        dense
        size="sm"
        color="blue-10"
        icon="add"
        noCaps
        v-close-popup
        @click="onAddClick"
      >
        <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 10]"
          >Agregar
        </q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<style scoped></style>
