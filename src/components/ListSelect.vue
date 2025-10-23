<script setup lang="ts">
import { listApi } from "@/connections/axiosCRM";
import type { IListID, ListResponseAPI } from "@/types";
import { useQuery } from "@tanstack/vue-query";
import type { QSelect } from "quasar";
import { withDefaults } from "vue";

const { list, filterPredicate, keepOptions } = withDefaults(
  defineProps<{
    list: IListID;
    filterPredicate?: (
      item: ListResponseAPI,
      index: number,
      list: ListResponseAPI[],
    ) => boolean;
    keepOptions?: boolean;
  }>(),
  {
    filterPredicate: () => true,
    keepOptions: true,
  },
);
const model = defineModel();
const getOptions = async () => {
  const { data } = await listApi.get<ListResponseAPI[]>(
    `/hansacrm-list/app-list-strings`,
    {
      params: {
        ListId: list,
      },
    },
  );

  return data;
};
const {
  data: options,
  isLoading,
  error,
  refetch,
} = useQuery({
  queryKey: [list],
  queryFn: getOptions,
  select(data) {
    return data.filter(filterPredicate).filter((item) => item.Value.length > 0);
  },
  initialData: [],
  enabled: !!model.value,
  refetchOnWindowFocus: false,
});

const filterFn = async (
  _inputValue: string,
  doneFn: (
    callbackFn: () => void,
    afterFn?: ((ref: QSelect) => void) | undefined,
  ) => void,
  abortFn: () => void,
) => {
  if (options.value.length > 0 && keepOptions) {
    doneFn(() => {});
    return;
  }
  try {
    refetch().then(() => {
      doneFn(() => {});
    });
  } catch (error) {
    abortFn();
  }
};

const filterAborted = () => {
  console.log("filterAborted");
};

const onFilter = (value: string, update: (callback: () => void) => void) => {
  filterFn(value, update, filterAborted);
};
</script>
<template>
  <q-select
    :loading="isLoading"
    :disabled="error"
    v-model="model"
    emit-value
    map-options
    options-dense
    option-value="ID"
    option-label="Value"
    :options="options"
    @filter="onFilter"
    @filter-aborted="filterAborted"
    v-bind="$props"
  >
    <template #no-option>
      <q-item dense>
        <q-item-section class="text-grey"> No hay opciones </q-item-section>
      </q-item>
    </template>
    <template #append>
      <slot name="append"></slot>
    </template>
  </q-select>
</template>
