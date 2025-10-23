<script setup lang="ts">
import moment from "moment";
import { computed, defineModel } from "vue";

const { unionString, mask, range, ...props } = withDefaults(
  defineProps<{
    unionString?: string;
    mask?: string;
    range?: boolean;
  }>(),
  {
    unionString: "-",
    mask: "YYYY-MM-DD",
    range: true,
  },
);

const dateRange = defineModel<{ from: string; to: string } | string | undefined>({
  required: true,
  get(v) {
    if(!v) {
      return "";
    }

    if(typeof v === "string") {
      return v;
    }

    if(v.from === v.to) {
      return v.from;
    }

    return v;
  },
});

const isValidDate = computed({
  get: () => {
    if (!dateRange.value) {
      return false;
    }

    if (typeof dateRange.value === "string") {
      return moment(dateRange.value, mask, true).isValid();
    }

    return (
      moment(dateRange.value.from, mask, true).isValid() &&
      moment(dateRange.value.to, mask, true).isValid()
    );
  },
  set: (val: boolean) => {
    if (!val) {
      dateRange.value = { from: "", to: "" };
    }
  },
});

const dateModel = computed({
  get: () => {
    if (!dateRange.value) {
      return "";
    }

    if (typeof dateRange.value === "string") {
      return dateRange.value;
    }

    return `${dateRange.value.from} ${unionString} ${dateRange.value.to}`;
  },
  set: (val: string) => {
    if (val.includes(unionString)) {
      const [from, to] = val.split(` ${unionString} `);

      if (!from || !to) {
        return;
      }

      dateRange.value = { from: from.trim(), to: to.trim() };
    } else {
      dateRange.value = { from: val.trim(), to: val.trim() };
    }
  },
});
</script>

<template>
  <q-input
    v-bind="props"
    v-model="dateModel"
    :error="!isValidDate || null"
    :error-message="!isValidDate ? 'Fecha inválida' : ''"
  >
    <template #append>
      <q-icon name="date_range" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-date
            v-model="dateRange"
            :mask="mask"
            dense
            :range="range"
            today-btn
          >
            <div class="row items-center justify-end">
              <slot name="actions"></slot>
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>
