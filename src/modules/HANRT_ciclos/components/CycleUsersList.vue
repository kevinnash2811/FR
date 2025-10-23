<script setup lang="ts">
import LoadingList from "@/components/LoadingList.vue";
import HeaderPage from "@/components/HeaderPage.vue";
import Pager from "@/components/Pager.vue";
import { computed, ref } from "vue";
import type { FilterUsers } from "../types";
import { useQuery } from "@tanstack/vue-query";
import { getTotalUsers, getUsers } from "../services";
import { usePagination } from '@/composables';

const { page, rowsPerPage } = usePagination({
  rowsPerPage: 20,
});

const selectedUsers = ref<string[]>([]);
const selectedAll = ref(false);
const filter = ref<FilterUsers>({
  filter: {
    easyFilter: "",
    idamercado_c: "",
    iddivision_c: "",
    idregional_c: "",
    reports_to_id: "",
  },
  sortBy: "user_name",
  order: "asc",
});
const { data: users, isLoading } = useQuery({
  queryKey: [
    "usersOfCycle",
    {
      filter,
      page,
      rowsPerPage,
    },
  ],
  queryFn: () => getUsers(filter.value, page.value, rowsPerPage.value),
  initialData: [],
});

const { data: totalUser } = useQuery({
  queryKey: [
    "usersOfCycleTotal",
    {
      filter,
      page,
      rowsPerPage,
    },
  ],
  queryFn: () => getTotalUsers(filter.value, page.value, rowsPerPage.value),
  initialData: 0,
});

const onSelectedUser = (value: boolean, user: { id: string }) => {
  if (value) {
    selectedUsers.value.push(user.id);
  } else {
    selectedUsers.value = selectedUsers.value.filter((id) => id !== user.id);
  }
};

const isAdded = computed(() => {
  return (user: { id: string }) =>
    selectedUsers.value.some((id) => id === user.id);
});
</script>

<template>
  <div class="column no-wrap" style="height: 100vh; max-height: 100vh">
    <HeaderPage title="Usuarios" closePopUp />
    <div class="q-pa-xs">
      <q-input
        rounded
        outlined
        dense
        label="Nombre | Nombre de usuario"
        debounce="500"
        v-model="filter.filter.easyFilter"
        style="width: 100%"
      >
        <template #after>
          <q-checkbox v-model="selectedAll">
            <q-tooltip>Seleccionar a todos los usuarios</q-tooltip>
          </q-checkbox>
          <q-btn icon="filter_list" flat round dense>
            <q-tooltip>Filtrar</q-tooltip>
          </q-btn>
        </template>
      </q-input>
    </div>
    <div style="flex-grow: 1; overflow: hidden">
      <loading-list
        :is-loading="isLoading"
        empty-message="No se encontraron usuarios"
        :is-empty="!users.length"
      >
        <q-virtual-scroll
          :items="users"
          style="height: 100%"
          v-slot="{ item }"
          :items-size="users.length"
        >
          <q-item
            v-ripple
            clickable
            :key="item.id"
            :dark="isAdded(item)"
            :class="{
              'bg-primary': isAdded(item),
            }"
            @click="onSelectedUser(!isAdded(item), item)"
          >
            <q-item-section avatar>
              <q-avatar
                color="primary"
                :style="{
                  outline: isAdded(item)
                    ? '1px solid white'
                    : '2px solid transparent',
                }"
              >
                <q-icon name="person" color="white" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="ellipsis"
                >{{ item.first_name }} {{ item.last_name }}</q-item-label
              >
              <q-item-label caption
                >{{ item.user_name }} | {{ item.rol_hbm_c }}</q-item-label
              >
            </q-item-section>
            <q-item-section side top>
              <q-item-label
                ><q-item-label caption>
                  {{ item.iddivision_c_label }}
                </q-item-label></q-item-label
              >
              <q-item-label
                ><q-item-label caption>
                  {{ item.idamercado_c_label }}
                </q-item-label></q-item-label
              >
            </q-item-section>
          </q-item>
        </q-virtual-scroll>
      </loading-list>
    </div>
    <pager
      v-if="users.length > 0"
      v-model:page="page"
      :limit="totalUser"
      :length="users.length"
      v-model:rows-per-page="rowsPerPage"
    />
  </div>
</template>

<style scoped></style>
