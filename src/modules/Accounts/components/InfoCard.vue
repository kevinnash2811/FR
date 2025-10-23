<script setup lang="ts">
const { title, empty } = defineProps<{
  title?: string;
  empty?: boolean;
  emptyText?: string;
}>();
</script>
<template>
  <q-expansion-item
    class="shadow-3 q-ma-sm q-pa-none"
    header-class="q-pr-none bg-grey-4"
    default-opened
  >
    <template v-if="title" v-slot:header>
      <div class="row items-center" style="gap: 10px; flex-grow: 1">
        <q-icon name="recent_actors" size="1.2rem" color="blue-10"></q-icon>
        <div>
          {{ title }}
        </div>
      </div>
    </template>
    <template else>
      <slot name="title" />
    </template>
    <div v-if="empty">
      <template v-if="emptyText">
        <div class="q-pa-md text-center">
          {{ emptyText }}
        </div>
      </template>
      <template v-else>
        <slot name="empty" />
      </template>
    </div>
    <div class="q-pa-xs" v-else>
      <slot />
    </div>
  </q-expansion-item>
</template>

<style scoped></style>
