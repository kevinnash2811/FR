<script setup lang="ts" generic="T extends { id: string }">
import { panels } from "@accounts/utils";
import { defineProps } from "vue";
import type { Geolocation } from "@accounts/types";

const { accounts, failureReason, isFetching, isLoading } = defineProps<{
  accounts: T[];
  isLoading: boolean;
  isFetching: boolean;
  failureReason: Error | null;
}>();

defineSlots<{
  account(props: { account: T }): T;
  empty(): any;
}>();

const tab = defineModel<Geolocation>();
</script>

<template>
  <div
    v-if="isLoading || isFetching"
    class="q-mx-auto row justify-center items-center"
    style="flex-grow: 1"
  >
    <q-spinner-dots color="primary" size="3em" class="" />
  </div>
  <div
    v-else-if="failureReason"
    style="flex-grow: 1"
    class="flex items-center justify-center"
  >
    <q-chip
      outline
      square
      color="red"
      text-color="white"
      icon="warning"
      :label="failureReason.message"
    />
  </div>
  <div
    v-else-if="accounts.length === 0"
    style="flex-grow: 1"
    class="flex items-center justify-center"
  > 
    <slot name="empty"></slot>
  </div>
  <q-tab-panels v-else v-model="tab" animated style="flex-grow: 1;" >
    <q-tab-panel
      v-for="panel in panels"
      :key="panel.name"
      v-bind="panel"
      class="q-gutter-y-xs q-pa-none"
    >
      <q-virtual-scroll
        :items="accounts"
        v-slot="{ item }"
        style="max-height: 100%;"
      >
        <slot name="account" :account="item" />
      </q-virtual-scroll>
    </q-tab-panel>
  </q-tab-panels>
</template>

<style scoped></style>
